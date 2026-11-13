export const SESSION_DURATION_DAYS = 7;

export const PART_SIZE = Number(process.env.UPLOAD_PART_SIZE_MB || 10) * 1024 * 1024;

export const MAX_FILE_SIZE = Number(process.env.MAX_VIDEO_SIZE_MB || 5120) * 1024 * 1024;

export const URL_EXPIRY_SECONDS = Number(process.env.UPLOAD_URL_EXPIRY_SECONDS || 900);

export const PLAYBACK_TTL_SECONDS = 900;

export const ALLOWED_CONTENT_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
];

export const MAX_PARTS = 10000;

export const INITIAL_BATCH_SIZE = Number(process.env.UPLOAD_INITIAL_BATCH_SIZE || 5);

export const RESOLUTION_DIMENSIONS = {
  '1080p': { maxWidth: 1920, maxHeight: 1080 },
  '720p': { maxWidth: 1280, maxHeight: 720 },
  '480p': { maxWidth: 854, maxHeight: 480 },
};

export const RETRY_PROCESSING_JOB_STATUS = ['failed', 'dead_lettered'];
