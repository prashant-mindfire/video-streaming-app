import { s3Client } from "@/config/rustfs";
import { AbortMultipartUploadCommand, CreateMultipartUploadCommand, UploadPartCommand, type CreateMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

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

export const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[/\\]/g, "_")
    .replace(/[^\w.\-() ]/g, "_")
    .slice(0, 200);
