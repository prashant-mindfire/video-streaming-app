export interface DashboardVideoSummary {
  total: number;
  ready: number;
  processing: number;
  failed: number;
}

export interface DashboardUploadSummary {
  total: number;
}

export interface DashboardProcessingJobSummary {
  queued: number;
  running: number;
  failed: number;
}

export interface DashboardStorageSummary {
  totalBytes: number;
}

export interface DashboardEngagementSummary {
  totalViews: number;
  totalDownloads: number;
}

export interface DashboardOverview {
  videos: DashboardVideoSummary;
  uploads: DashboardUploadSummary;
  processingJobs: DashboardProcessingJobSummary;
  storage: DashboardStorageSummary;
  engagement: DashboardEngagementSummary;
  averageProcessingTimeSeconds: number;
}

export interface DashboardSummary {
  totalVideos: number;
  totalStorageBytes: number;
  totalViews: number;
  totalDownloads: number;
}

export interface ProcessingSummary {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface ActivityItem {
  date: string;
  views: number;
  downloads: number;
}

export interface RecentProcessingJob {
  id: string;
  videoId: string;
  videoTitle: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead_lettered';
  progress: number;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}
