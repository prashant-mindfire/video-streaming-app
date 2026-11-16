export type VideoStatus = 'queued' | 'processing' | 'ready' | 'failed';

export interface Video {
  id: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  thumbnailObjectKey?: string | null;
  duration?: number | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  codec?: string | null;
  fileSize: number;
  resolution?: string;
  status: VideoStatus;
  progress?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface VideoFilters {
  search: string;
  status: '' | VideoStatus;
  sortBy: 'newest' | 'oldest' | 'title';
}

export interface VideoQueryFilters extends VideoFilters {
  page?: number;
  pageSize?: number;
}

export interface VideoDetail extends Video {
  metadata?: {
    durationSeconds?: number | null;
    width?: number | null;
    height?: number | null;
    codec?: string | null;
    fileSize: number;
  };
}

export interface PaginatedVideos {
  videos: Video[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlaybackResponse {
  streamUrl: string;
}

export interface VideoProcessingStatus {
  status: 'queued' | 'processing' | 'ready' | 'failed';
  progress: number;
  currentStage: string;
  updatedAt: string;
}

export interface VideoDownloadLink {
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
}
