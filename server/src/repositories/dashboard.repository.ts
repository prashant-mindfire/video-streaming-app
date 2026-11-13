import { pool } from '@/config/db';
import type { DashboardMetricsRow } from '@/models/dashboard.model';

export const getDashboardMetrics = async (): Promise<DashboardMetricsRow | undefined> => {
  const result = await pool.query<DashboardMetricsRow>(`
    SELECT
      -- Video metrics
      (
        SELECT COUNT(*)
        FROM videos
      ) AS total_videos,

      (
        SELECT COUNT(*)
        FROM videos
        WHERE status = 'ready'
      ) AS ready_videos,

      (
        SELECT COUNT(*)
        FROM videos
        WHERE status = 'processing'
      ) AS processing_videos,

      (
        SELECT COUNT(*)
        FROM videos
        WHERE status = 'failed'
      ) AS failed_videos,

      -- Upload metrics
      (
        SELECT COUNT(*)
        FROM video_uploads
      ) AS total_uploads,

      -- Processing job metrics
      (
        SELECT COUNT(*)
        FROM processing_jobs
        WHERE status = 'queued'
      ) AS queued_jobs,

      (
        SELECT COUNT(*)
        FROM processing_jobs
        WHERE status = 'running'
      ) AS running_jobs,

      (
        SELECT COUNT(*)
        FROM processing_jobs
        WHERE status IN ('failed', 'dead_lettered')
      ) AS failed_jobs,

      -- Storage metrics: original videos + processed variants
      (
        SELECT
          COALESCE(SUM(file_size), 0)
          FROM videos
      ) +
      (
        SELECT
          COALESCE(SUM(file_size), 0)
          FROM video_variants
      ) AS total_storage_bytes,

      -- Engagement metrics
      (
        SELECT COUNT(*)
        FROM video_events
        WHERE event_type = 'view'
      ) AS total_views,

      (
        SELECT COUNT(*)
        FROM video_events
        WHERE event_type = 'download'
      ) AS total_downloads,

      -- Average processing time
      (
        SELECT
          COALESCE(
            ROUND(
              AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric,
              2
            ),
            0
          )
        FROM processing_jobs
        WHERE status = 'completed'
          AND started_at IS NOT NULL
          AND completed_at IS NOT NULL
      ) AS average_processing_time_seconds
  `);

  return result.rows[0];
};
