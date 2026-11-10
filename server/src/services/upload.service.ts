import { RUSTFS_BUCKET_NAME, s3Client } from "@/config/rustfs";
import { UploadStatus, type InitiateUploadInput } from "@/models/upload.model";
import * as UploadRepository from "@/repositories/upload.repository";
import * as VideoRepository from "@/repositories/video.repository";
import * as JobRepository from "@/repositories/job.repository";
import * as OutboxRepository from "@/repositories/outbox.repository";
import type { UploadPart } from "@/types/upload";
import { AppError } from "@/utils/app.error";
import { INITIAL_BATCH_SIZE, MAX_FILE_SIZE, PART_SIZE } from "@/utils/constants";
import { abortMultipartUpload, createMultipartUpload, generatePartUrls, getPartNumbers, getTotalParts, listParts } from "@/utils/multipart-upload";
import { withTransaction } from "@/utils/withTransaction";
import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

/**
 * Initiate multipart upload
 */
export const initiateUpload = async (
  userId: string,
  input: InitiateUploadInput
) => {
  const { fileName, contentType, fileSize } = input;

  if (!fileName || !contentType || !fileSize || fileSize <= 0) {
    throw new AppError("Invalid upload details", 400);
  }

  if (!contentType.startsWith("video/")) {
    throw new AppError("Only video files are allowed", 400);
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new AppError("Video exceeds the maximum allowed size", 400);
  }

  const uploadId = randomUUID();
  const partSize = PART_SIZE;
  const totalParts = getTotalParts(fileSize);

  if (totalParts > 10000) {
    throw new AppError("Video requires too many upload parts", 400);
  }

  const safeFileName = fileName.replace(/[^\w.-]/g, "_");
  const objectKey =
    `videos/${userId}/${uploadId}/original/${safeFileName}`;

  const multipartResult = await createMultipartUpload(
    RUSTFS_BUCKET_NAME,
    objectKey,
    contentType
  );

  if (!multipartResult.UploadId) {
    throw new AppError("Could not initiate multipart upload", 500);
  }

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const upload = await UploadRepository.createUpload({
      id: uploadId,
      userId,
      fileName,
      objectKey,
      multipartUploadId: multipartResult.UploadId,
      fileSize,
      contentType,
      partSize,
      totalParts,
      expiresAt,
    });

    const initialPartNumbers = getPartNumbers(totalParts).slice(
      0,
      INITIAL_BATCH_SIZE
    );

    const parts = await generatePartUrls(upload, initialPartNumbers);

    return {
      uploadId,
      fileName,
      fileSize,
      partSize,
      totalParts,
      status: upload.status,
      parts,
      nextPartNumbers: getPartNumbers(totalParts).slice(
        INITIAL_BATCH_SIZE
      ),
    };
  } catch (error) {
    // If DB insertion or URL generation fails, clean up the RustFS upload.
    await abortMultipartUpload(
      RUSTFS_BUCKET_NAME,
      objectKey,
      multipartResult.UploadId
    );

    throw error;
  }
};

export const generatePartUploadUrls = async (
  userId: string,
  uploadId: string,
  partNumbers: number[]
) => {
 const upload = await UploadRepository.findUploadByIdAndUserId(
    uploadId,
    userId
  );

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  if (upload.status === UploadStatus.COMPLETED || upload.status === UploadStatus.ABORTED) {
    throw new AppError("Upload is no longer active", 400);
  }

  if (new Date(upload.expires_at as Date).getTime() <= Date.now()) {
    throw new AppError("Upload has expired", 400);
  }

  if (!Array.isArray(partNumbers) || partNumbers.length === 0) {
    throw new AppError("At least one part number is required", 400);
  }

  if (partNumbers.length > 100) {
    throw new AppError("Request a maximum of 100 parts at a time", 400);
  }

  const uniquePartNumbers = [...new Set(partNumbers)];

  if (uniquePartNumbers.length !== partNumbers.length) {
    throw new AppError("Duplicate part numbers are not allowed", 400);
  }

  const invalidPartNumber = partNumbers.some(
    (partNumber) =>
      !Number.isInteger(partNumber) ||
      partNumber < 1 ||
      partNumber > upload.total_parts
  );

  if (invalidPartNumber) {
    throw new AppError("Invalid part number", 400);
  }

  const parts = await generatePartUrls(upload, partNumbers);

  return {
    uploadId,
    parts,
  };
};

export const completeUpload = async (
  userId: string,
  uploadId: string,
  submittedParts: UploadPart[]
) => {
  const upload = await UploadRepository.findUploadByIdAndUserId(
    uploadId,
    userId
  );

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  if (upload.status === UploadStatus.COMPLETED) {
    throw new AppError("Upload has already been completed", 409);
  }

  if (upload.status === UploadStatus.ABORTED) {
    throw new AppError("Upload has been aborted", 400);
  }

  if (new Date(upload.expires_at as Date).getTime() <= Date.now()) {
    throw new AppError("Upload has expired", 400);
  }

  if (!Array.isArray(submittedParts) || submittedParts.length === 0) {
    throw new AppError("Uploaded parts are required", 400);
  }

  const sortedParts = [...submittedParts].sort(
    (a, b) => a.partNumber - b.partNumber
  );

  const expectedPartNumbers = getPartNumbers(upload.total_parts);

  if (
    sortedParts.length !== expectedPartNumbers.length ||
    sortedParts.some(
      (part, index) =>
        part.partNumber !== expectedPartNumbers[index] ||
        !part.etag
    )
  ) {
    throw new AppError("Missing or invalid uploaded parts", 400);
  }

  // Verify that RustFS actually received every part and that ETags match.
  const uploadedParts: {
    PartNumber?: number | undefined;
    ETag?: string | undefined;
  }[] = [];

  let marker: string | undefined;

  do {
    const result = await listParts(RUSTFS_BUCKET_NAME, upload.object_key, upload.multipart_upload_id, marker);

    uploadedParts.push(...(result.Parts || []));
    marker = result.IsTruncated
      ? result.NextPartNumberMarker
      : undefined;
  } while (marker !== undefined);

  const actualParts = new Map(
    uploadedParts.map((part) => [
      part.PartNumber,
      part.ETag?.replace(/^"|"$/g, ""),
    ])
  );

  const partsToComplete = sortedParts.map((part) => {
    const actualEtag = actualParts.get(part.partNumber);
    const submittedEtag = part.etag.replace(/^"|"$/g, "");

    if (!actualEtag || actualEtag !== submittedEtag) {
      throw new AppError(
        `Part ${part.partNumber} is missing or has an invalid ETag`,
        400
      );
    }

    return {
      PartNumber: part.partNumber,
      ETag: actualParts.get(part.partNumber),
    };
  });

  await s3Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: RUSTFS_BUCKET_NAME,
      Key: upload.object_key,
      UploadId: upload.multipart_upload_id,
      MultipartUpload: {
        Parts: partsToComplete,
      },
    })
  );

  const { videoId, jobId } = await withTransaction(async (client) => {
    const videoId = await VideoRepository.createVideo(client, {
      userId,
      uploadId,
      title: upload.original_filename,
      objectKey: upload.object_key,
      fileSize: upload.file_size,
    });

    const jobId = await JobRepository.createVideoProcessingJob(client, videoId);

    await OutboxRepository.insertOutboxEvent(client, "video.processing.requested", {
      jobId,
      videoId,
      userId,
      originalObjectKey: upload.object_key
    });

    await UploadRepository.updateUploadStatus(uploadId, UploadStatus.COMPLETED, client);

    return { videoId, jobId };
  });

  return {
    uploadId,
    videoId,
    jobId,
    status: "queued",
    message: "Upload completed and video processing has been queued",
  };
};