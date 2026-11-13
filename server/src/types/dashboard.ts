export interface DashboardOverview {
  videos: {
    total: number;
    ready: number;
    processing: number;
    failed: number;
  };
  uploads: {
    total: number;
  };
  processingJobs: {
    queued: number;
    running: number;
    failed: number;
  };
  storage: {
    totalBytes: number;
  };
  engagement: {
    totalViews: number;
    totalDownloads: number;
  };
  averageProcessingTimeSeconds: number;
}
