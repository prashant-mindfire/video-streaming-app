import * as VideoRepository from '@/repositories/video.repository';
import * as VideoCaptionRepository from '@/repositories/VideoCaption.repository';
import { AppError } from '@/utils/app.error';
import { deleteVideoObjects, downloadVideo, getPresignedObjectUrl } from '@/utils/multipart-upload';
import { getVideoProgress } from './video-progress.service';
import { URL_EXPIRY_SECONDS } from '@/utils/constants';
import {
  createPlaybackAccess,
  type PlaybackAccessResponse,
  type PlaybackCaption,
} from './playback-access.service';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { RUSTFS_BUCKET_NAME, s3PresignClient } from '@/config/rustfs';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface ListVideosParams {
  userId: string;
  search?: string | undefined;
  status?: string | undefined;
  page: number;
  pageSize: number;
  sortBy?: string | undefined;
  sortOrder?: string | undefined;
}

const allowedSortFields = ['created_at', 'title', 'file_size'] as const;
const semanticSorts = {
  newest: { sortBy: 'created_at', sortOrder: 'DESC' },
  oldest: { sortBy: 'created_at', sortOrder: 'ASC' },
  title: { sortBy: 'title', sortOrder: 'ASC' },
} as const;

/** Lists the user's videos while mapping semantic sort names to allowlisted repository fields. */
export const listVideos = async (params: ListVideosParams) => {
  const { pageSize, ...repositoryParams } = params;
  const semanticSort = params.sortBy
    ? semanticSorts[params.sortBy as keyof typeof semanticSorts]
    : undefined;
  const sortBy =
    semanticSort?.sortBy ??
    (allowedSortFields.includes(params.sortBy as (typeof allowedSortFields)[number])
      ? (params.sortBy as (typeof allowedSortFields)[number])
      : 'created_at');

  const requestedSortOrder = params.sortOrder?.toUpperCase();
  const sortOrder =
    requestedSortOrder === 'ASC' || requestedSortOrder === 'DESC'
      ? requestedSortOrder
      : (semanticSort?.sortOrder ?? 'DESC');

  const result = await VideoRepository.findVideos({
    ...repositoryParams,
    limit: pageSize,
    sortBy,
    sortOrder,
  });

  const videos = await Promise.all(
    result.videos.map(async (video) => {
      const thumbnailUrl = video.thumbnail_object_key
        ? await getSignedUrl(
            s3PresignClient,
            new GetObjectCommand({
              Bucket: RUSTFS_BUCKET_NAME,
              Key: video.thumbnail_object_key,
            }),
            { expiresIn: 3600 },
          )
        : null;

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailObjectKey: video.thumbnail_object_key,
        thumbnailUrl,
        durationSeconds: video.duration_seconds,
        width: video.width,
        height: video.height,
        codec: video.codec,
        fileSize: Number(video.file_size),
        status: video.status,
        createdAt: video.created_at,
      };
    }),
  );

  return {
    videos,
    page: params.page,
    limit: pageSize,
    total: result.total,
    totalPages: Math.ceil(result.total / pageSize),
  };
};

export const getVideo = async (videoId: string, userId: string) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError('Video not found', 404);
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

export const deleteVideo = async (videoId: string, userId: string) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  await deleteVideoObjects(userId, videoId);

  await VideoRepository.deleteVideo(videoId, userId);
};

export const getProcessingStatus = async (videoId: string, userId: string) => {
  const dbStatus = await VideoRepository.findVideoProcessingStatus(videoId, userId);

  if (!dbStatus) {
    throw new AppError('Video not found', 404);
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
      ? 'Processing failed'
      : dbStatus.video_status === 'ready'
        ? 'Processing completed'
        : dbStatus.video_status === 'queued'
          ? 'Waiting for processing'
          : 'Processing',
    updatedAt: dbStatus.updated_at,
    error: dbStatus.last_error,
  };
};

/** Creates playback access only when the owner-scoped video is ready and has an HLS master playlist. */
export const createVideoPlaybackSession = async (
  videoId: string,
  userId: string,
): Promise<PlaybackAccessResponse> => {
  const video = await VideoRepository.findVideoForPlayback(videoId, userId);

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  if (video.status !== 'ready' || !video.hls_master_playlist_key) {
    throw new AppError('Video is not ready for playback', 409);
  }

  const playbackAccess = await createPlaybackAccess({
    videoId,
    userId,
    masterPlaylistKey: video.hls_master_playlist_key,
  });

  //TODO: Video Captions
  // const captionRecords = await VideoCaptionRepository.findByVideoId(videoId);

  // Generate a presigned URL for each caption file stored in RustFS.
  // const captions = await Promise.all(
  //   captionRecords.map(async (caption) => ({
  //     id: caption.id,
  //     languageCode: caption.language_code,
  //     label: caption.label,
  //     url: await getPresignedObjectUrl(caption.object_key),
  //     isDefault: caption.is_default,
  //   })),
  // );

  return {
    ...playbackAccess,
    // captions,
  };
};

export const getVideoDownloadLink = async (videoId: string, userId: string) => {
  const video = await VideoRepository.findVideoById(videoId, userId);

  if (!video) {
    throw new AppError('Video not found', 404);
  }

  const downloadUrl = await downloadVideo(video.original_object_key, video.title);

  return {
    downloadUrl,
    expiresAt: new Date(Date.now() + URL_EXPIRY_SECONDS * 1000),
  };
};
