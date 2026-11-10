import { RUSTFS_BUCKET_NAME, s3Client } from "@/config/rustfs";
import { AbortMultipartUploadCommand, CreateMultipartUploadCommand, ListPartsCommand, UploadPartCommand, type CreateMultipartUploadCommandOutput, type ListPartsCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PART_SIZE, URL_EXPIRY_SECONDS } from "./constants";

/**
 * Generates a temporary URL to upload a specific part of a chunked file
 */
export const generatePresignedPartUrl = async (
  bucketName: string,
  objectKey: string,
  uploadId: string,
  partNumber: number
): Promise<string> => {
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: objectKey,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  // Generates a secure link that expires automatically in 15 minutes (900 seconds)
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: URL_EXPIRY_SECONDS });

  return presignedUrl;
};

export const createMultipartUpload = async (
  bucketName: string,
  objectKey: string,
  contentType: string
): Promise<CreateMultipartUploadCommandOutput> => {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: contentType,
  });

  const result = await s3Client.send(command);
  return result;
};

export const abortMultipartUpload = async (
  bucketName: string,
  objectKey: string,
  uploadId: string
): Promise<void> => {
  const command = new AbortMultipartUploadCommand({
    Bucket: bucketName,
    Key: objectKey,
    UploadId: uploadId,
  });

  await s3Client.send(command);
};

export const listParts = async (
  bucketName: string,
  objectKey: string,
  uploadId: string,
  marker?: string,
): Promise<ListPartsCommandOutput> => {
  const command = new ListPartsCommand({
    Bucket: bucketName,
    Key: objectKey,
    UploadId: uploadId,
    PartNumberMarker: marker,
  });

  return await s3Client.send(command); 
};

export const generatePartUrls = async (
  upload: {
    object_key: string;
    multipart_upload_id: string;
    total_parts: number;
  },
  partNumbers: number[]
) => {
  return Promise.all(
    partNumbers.map(async (partNumber) => {
      const uploadUrl = await generatePresignedPartUrl(RUSTFS_BUCKET_NAME, upload.object_key, upload.multipart_upload_id, partNumber);

      return {
        partNumber,
        uploadUrl,
        expiresIn: URL_EXPIRY_SECONDS,
      };
    })
  );
};

export const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[/\\]/g, "_")
    .replace(/[^\w.\-() ]/g, "_")
    .slice(0, 200);

export const getTotalParts = (fileSize: number) =>
  Math.ceil(fileSize / PART_SIZE);

export const getPartNumbers = (totalParts: number) =>
  Array.from({ length: totalParts }, (_, index) => index + 1);
