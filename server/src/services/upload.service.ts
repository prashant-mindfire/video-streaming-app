import { randomUUID } from "crypto";
import {
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as UploadRepository from "@/repositories/upload.repository";
import type { InitiateUploadInput } from "@/models/upload.model";
import { AppError } from "@/utils/app.error";
import { abortMultipartUpload, createMultipartUpload, sanitizeFileName } from "@/utils/multipart-upload";
import { RUSTFS_BUCKET_NAME } from "@/config/rustfs";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE, MAX_PARTS, PART_SIZE } from "@/utils/constants";

/**
 * Initiate multipart upload
 */
export const initiateUpload = async (
  userId: string,
  input: InitiateUploadInput
) => {
  const { fileName, contentType, fileSize } = input;

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    throw new AppError("Unsupported video content type", 400);
  }

  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) {
    throw new AppError("Invalid file size", 400);
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new AppError("Video exceeds maximum allowed size", 400);
  }

  const totalParts = Math.ceil(fileSize / PART_SIZE);

  if (totalParts > MAX_PARTS) {
    throw new AppError("Too many upload parts", 400);
  }

  const uploadId = randomUUID();
  const safeFileName = sanitizeFileName(fileName);

  const objectKey =
    `videos/${userId}/${uploadId}/original/${safeFileName}`;

  // Initiate multipart upload in RustFS.
  const multipartResult = await createMultipartUpload(
    RUSTFS_BUCKET_NAME,
    objectKey,
    contentType
  );

  if (!multipartResult.UploadId) {
    throw new AppError("Unable to initiate multipart upload", 500);
  }

  try {
    // Save upload information in PostgreSQL.
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const upload = await UploadRepository.createUpload({
      id: uploadId,
      userId,
      fileName: safeFileName,
      objectKey,
      multipartUploadId: multipartResult.UploadId,
      fileSize,
      contentType,
      partSize: PART_SIZE,
      totalParts,
      expiresAt,
    });

    return {
      uploadId: upload.id,
      fileName: upload.original_filename,
      fileSize: Number(upload.file_size),
      partSize: Number(upload.part_size),
      totalParts: upload.total_parts,
      status: upload.status,
    };
  } catch (error) {
    // Roll back the storage operation if DB insertion fails.
    await abortMultipartUpload(
        RUSTFS_BUCKET_NAME,
        objectKey,
        multipartResult.UploadId
    );

    throw error;
  }
};

export const generatePartUploadUrl = async (
  userId: string,
  uploadId: string,
  partNumber: number
) => {
  // Step 1: Find upload and validate ownership.
  const upload =
    await uploadRepository.findUploadByIdAndUserId(
      uploadId,
      userId
    );

  if (!upload) {
    throw new AppError(404, "Upload not found");
  }

  if (
    upload.status !== "initiated" &&
    upload.status !== "uploading"
  ) {
    throw new AppError(400, "Upload is not in a valid state");
  }

  if (
    upload.expires_at &&
    upload.expires_at.getTime() <= Date.now()
  ) {
    throw new AppError(410, "Upload has expired");
  }

  if (
    !Number.isInteger(partNumber) ||
    partNumber < 1 ||
    partNumber > upload.total_parts
  ) {
    throw new AppError(400, "Invalid part number");
  }

  // Step 2: Generate presigned URL using RustFS.
  const command = new UploadPartCommand({
    Bucket: RUSTFS_BUCKET_NAME,
    Key: upload.object_key,
    UploadId: upload.multipart_upload_id,
    PartNumber: partNumber,
  });

  const uploadUrl = await getSignedUrl(
    rustfsClient,
    command,
    {
      expiresIn: URL_EXPIRY_SECONDS,
    }
  );

  // Step 3: Update upload status.
  if (upload.status === "initiated") {
    await uploadRepository.updateUploadStatus(
      uploadId,
      "uploading"
    );
  }

  return {
    uploadId,
    partNumber,
    uploadUrl,
    expiresInSeconds: URL_EXPIRY_SECONDS,
  };
};