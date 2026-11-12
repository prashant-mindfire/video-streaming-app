export enum UploadStatus {
  INITIATED = 'initiated',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface InitiateUploadInput {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface CreateUploadRecordInput {
  id: string;
  userId: string;
  fileName: string;
  objectKey: string;
  multipartUploadId: string;
  fileSize: number;
  contentType: string;
  partSize: number;
  totalParts: number;
  expiresAt: Date;
}

export interface VideoUpload {
  id: string;
  user_id: string;
  original_filename: string;
  object_key: string;
  multipart_upload_id: string;
  file_size: string;
  content_type: string;
  part_size: string;
  total_parts: number;
  status: UploadStatus;
  expires_at: Date | null;
  created_at: Date | null;
  completed_at: Date | null;
}