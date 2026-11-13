import { S3Client } from '@aws-sdk/client-s3';

export const RUSTFS_BUCKET_NAME = process.env.RUSTFS_BUCKET_NAME as string;

export const s3Client = new S3Client({
  endpoint: process.env.RUSTFS_STORAGE_ENDPOINT as string,
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY as string,
    secretAccessKey: process.env.RUSTFS_SECRET_KEY as string,
  },
  region: process.env.RUSTFS_REGION as string,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});
