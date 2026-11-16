import { S3Client } from '@aws-sdk/client-s3';

export const RUSTFS_BUCKET_NAME = process.env.RUSTFS_BUCKET_NAME as string;

const sharedConfig = {
  credentials: {
    accessKeyId: process.env.RUSTFS_ACCESS_KEY as string,
    secretAccessKey: process.env.RUSTFS_SECRET_KEY as string,
  },
  region: process.env.RUSTFS_REGION as string,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED' as const,
  responseChecksumValidation: 'WHEN_REQUIRED' as const,
};

export const s3Client = new S3Client({
  ...sharedConfig,
  endpoint: process.env.RUSTFS_STORAGE_ENDPOINT as string,
});

export const s3PresignClient = new S3Client({
  ...sharedConfig,
  endpoint: (process.env.RUSTFS_PUBLIC_ENDPOINT ||
    process.env.RUSTFS_STORAGE_ENDPOINT) as string,
});
