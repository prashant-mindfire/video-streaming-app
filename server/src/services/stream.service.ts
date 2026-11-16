import { GetObjectCommand } from '@aws-sdk/client-s3';
import { RUSTFS_BUCKET_NAME, s3Client } from '@/config/rustfs';
import { AppError } from '@/utils/app.error';
import { getPlaybackSession } from './playback-access.service';

export interface StreamAssetResult {
  stream: NodeJS.ReadableStream;
  contentType: string;
  contentLength?: number | undefined;
  cacheControl: string;
}

export const getHlsAssetStream = async (
  token: string | undefined,
  rawFilePath: string | string[] | undefined,
): Promise<StreamAssetResult> => {
  // Normalize Express v5 wildcard path segments
  const assetPath = Array.isArray(rawFilePath) ? rawFilePath.join('/') : rawFilePath;

  if (!token || !assetPath) {
    throw new AppError('Invalid stream request', 400);
  }

  // Prevent directory traversal and restrict to valid HLS file extensions
  if (assetPath.includes('..') || (!assetPath.endsWith('.m3u8') && !assetPath.endsWith('.ts'))) {
    throw new AppError('Invalid HLS asset path', 400);
  }

  // Validate playback session in Redis
  const session = await getPlaybackSession(token);
  if (!session) {
    throw new AppError('Playback session expired or invalid', 401);
  }

  const objectKey = `${session.hlsBasePrefix}/${assetPath}`;

  try {
    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: RUSTFS_BUCKET_NAME,
        Key: objectKey,
      }),
    );

    if (!s3Response.Body) {
      throw new AppError('HLS asset not found', 404);
    }

    const isPlaylist = assetPath.endsWith('.m3u8');

    return {
      stream: s3Response.Body as NodeJS.ReadableStream,
      contentType: isPlaylist ? 'application/vnd.apple.mpegurl' : 'video/mp2t',
      contentLength: s3Response.ContentLength,
      cacheControl: isPlaylist ? 'no-cache' : 'public, max-age=31536000, immutable',
    };
  } catch (error: unknown) {
    const storageError = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    } | null;

    if (storageError?.name === 'NoSuchKey' || storageError?.$metadata?.httpStatusCode === 404) {
      throw new AppError('HLS file not found in storage', 404);
    }
    throw error;
  }
};
