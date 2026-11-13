export interface DashboardMetricsRow {
  total_videos: string | number;
  ready_videos: string | number;
  processing_videos: string | number;
  failed_videos: string | number;
  total_uploads: string | number;
  queued_jobs: string | number;
  running_jobs: string | number;
  failed_jobs: string | number;
  total_storage_bytes: string | number;
  total_views: string | number;
  total_downloads: string | number;
  average_processing_time_seconds: string | number;
}
