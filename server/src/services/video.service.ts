import * as VideoRepository from "@/repositories/video.repository";
import { AppError } from "@/utils/app.error";
import { deleteVideoObjects, downloadVideo } from "@/utils/multipart-upload";
import { getVideoProgress } from "./video-progress.service";
import { URL_EXPIRY_SECONDS } from "@/utils/constants";
import { createPlaybackAccess, type PlaybackAccessResponse } from "./playback-access.service";

interface ListVideosParams {
  userId: string;
  search?: string;
  status?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: string;
}

const allowedSortFields = [
  "created_at",
  "title",
  "file_size",
] as const;

export const listVideos = async (params: ListVideosParams) => {
  const sortBy = allowedSortFields.includes(
    params.sortBy as (typeof allowedSortFields)[number]
  )
    ? (params.sortBy as (typeof allowedSortFields)[number])
    : "created_at";

  const sortOrder =
    params.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const result = await VideoRepository.findVideos({
    ...params,
    sortBy,
    sortOrder,
  });

  return {
    videos: result.videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailObjectKey: video.thumbnail_object_key,
      durationSeconds: video.duration_seconds,
      width: video.width,
      height: video.height,
      codec: video.codec,
      fileSize: Number(video.file_size),
      status: video.status,
      createdAt: video.created_at,
    })),
    page: params.page,
    limit: params.limit,
    total: result.total,
    totalPages: Math.ceil(result.total / params.limit),
  };
};

export const getVideo = async (
  videoId: string,
  userId: string
) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    status: video.status,
    metadata: {
      durationSeconds: video.duration_seconds,
      width: video.width,
      height: video.height,
      codec: video.codec,
      fileSize: Number(video.file_size),
    },
    thumbnailObjectKey: video.thumbnail_object_key,
    createdAt: video.created_at,
    updatedAt: video.updated_at,
  };
};

export const deleteVideo = async (
  videoId: string,
  userId: string
) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  await deleteVideoObjects(userId, videoId);

  await VideoRepository.deleteVideo(videoId, userId);
};

export const getProcessingStatus = async (
  videoId: string,
  userId: string
) => {
  const dbStatus = await VideoRepository.findVideoProcessingStatus(videoId, userId);

  if (!dbStatus) {
    throw new AppError("Video not found", 404);
  }

  // Redis contains the latest progress during processing.
  const cacheProgress = await getVideoProgress(videoId);

  if (cacheProgress) {
    return {
      videoId,
      ...cacheProgress,
    };
  }

  // Fall back to PostgreSQL if Redis has no entry.
  return {
    videoId,
    status: dbStatus.video_status,
    progress: dbStatus.progress ?? 0,
    currentStage: dbStatus.last_error
      ? "Processing failed"
      : dbStatus.video_status === "ready"
        ? "Processing completed"
        : dbStatus.video_status === "queued"
          ? "Waiting for processing"
          : "Processing",
    updatedAt: dbStatus.updated_at,
    error: dbStatus.last_error,
  };
};

export const createVideoPlaybackSession = async (
  videoId: string,
  userId: string
): Promise<PlaybackAccessResponse> => {
  const video = await VideoRepository.findVideoForPlayback(videoId, userId);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  if (video.status !== "ready" || !video.hls_master_playlist_key) {
    throw new Error("Video is not ready for playback");
  }

  return await createPlaybackAccess({
    videoId,
    userId,
    masterPlaylistKey: video.hls_master_playlist_key,
  });
};

export const getVideoDownloadLink = async (
  videoId: string,
  userId: string
) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError("Video not found", 404);
  }

  const downloadUrl = await downloadVideo(video.original_object_key, video.title);

  return {
    downloadUrl,
    expiresAt: new Date(Date.now() + URL_EXPIRY_SECONDS * 1000),
  };
};
