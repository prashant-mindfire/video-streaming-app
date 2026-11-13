import * as DashboardRepository from "@/repositories/dashboard.repository";
import type { DashboardOverview } from "@/types/dashboard";
import { AppError } from "@/utils/app.error";

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const metrics = await DashboardRepository.getDashboardMetrics();

  if (!metrics) {
    throw new AppError("No data found", 400);
  }

  return {
    videos: {
      total: Number(metrics.total_videos),
      ready: Number(metrics.ready_videos),
      processing: Number(metrics.processing_videos),
      failed: Number(metrics.failed_videos),
    },

    uploads: {
      total: Number(metrics.total_uploads),
    },

    processingJobs: {
      queued: Number(metrics.queued_jobs),
      running: Number(metrics.running_jobs),
      failed: Number(metrics.failed_jobs),
    },

    storage: {
      totalBytes: Number(metrics.total_storage_bytes),
    },

    engagement: {
      totalViews: Number(metrics.total_views),
      totalDownloads: Number(metrics.total_downloads),
    },

    averageProcessingTimeSeconds: Number(
      metrics.average_processing_time_seconds
    ),
  };
};
