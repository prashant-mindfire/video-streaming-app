export const SESSION_DURATION_DAYS = 7;

export const PART_SIZE =
  Number(process.env.UPLOAD_PART_SIZE_MB || 10) *
  1024 *
  1024;

export const MAX_FILE_SIZE =
  Number(process.env.MAX_VIDEO_SIZE_MB || 5120) *
  1024 *
  1024;

export const URL_EXPIRY_SECONDS = Number(
  process.env.UPLOAD_URL_EXPIRY_SECONDS || 900
);

export const ALLOWED_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
];

export const MAX_PARTS = 10000;