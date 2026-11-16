export interface InitiateUploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface InitiateUploadResponse {
  uploadId: string;
  partSize: number;
}

export interface UploadPartUrl {
  partNumber: number;
  uploadUrl: string;
}

export interface UploadPartsResponse {
  parts: UploadPartUrl[];
}

export interface CompletedUploadPart {
  partNumber: number;
  etag: string;
}

export interface CompleteUploadRequest {
  parts: CompletedUploadPart[];
}

export interface CompleteUploadResponse {
  videoId: string;
}

export type UploadStatus = 'queued' | 'uploading' | 'uploaded' | 'failed';

export interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadId?: string;
  videoId?: string;
}
