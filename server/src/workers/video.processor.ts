import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { mkdir, readdir, readFile, rm } from 'fs/promises';
import { pipeline } from 'stream/promises';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { extractMetadata, generateThumbnail, transcodeToHls } from '../services/ffmpeg.service';
import { withTransaction } from '@/utils/withTransaction';
import { pool } from '@/config/db';
import type { VideoProcessingMessage } from '@/types/processing';
import { RUSTFS_BUCKET_NAME, s3Client } from '@/config/rustfs';
import { updateVideoProgress } from '@/services/video-progress.service';

const downloadOriginal = async (objectKey: string, destination: string) => {
  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: RUSTFS_BUCKET_NAME,
      Key: objectKey,
    }),
  );

  if (!result.Body) throw new Error('Original video not found');

  await pipeline(result.Body as NodeJS.ReadableStream, createWriteStream(destination));
};

const uploadFile = async (filePath: string, objectKey: string, contentType: string) => {
  const body = await readFile(filePath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: RUSTFS_BUCKET_NAME,
      Key: objectKey,
      Body: body,
      ContentType: contentType,
    }),
  );
};

const uploadDirectory = async (directory: string, objectPrefix: string) => {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await uploadDirectory(filePath, `${objectPrefix}/${entry.name}`);
      continue;
    }

    const contentType = entry.name.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : 'video/mp2t';

    await uploadFile(filePath, `${objectPrefix}/${entry.name}`, contentType);
  }
};

export const processVideo = async (message: VideoProcessingMessage) => {
  const workDirectory = path.join(os.tmpdir(), randomUUID());

  await mkdir(workDirectory, { recursive: true });

  const inputPath = path.join(workDirectory, 'original-video');
  const thumbnailPath = path.join(workDirectory, 'thumbnail.jpg');

  try {
    await updateVideoProgress(message.videoId, 5, 'Downloading original video');
    await downloadOriginal(message.originalObjectKey, inputPath);

    await updateVideoProgress(message.videoId, 10, 'Extracting video metadata');
    const metadata = await extractMetadata(inputPath);

    await updateVideoProgress(message.videoId, 20, 'Generating thumbnail');
    await generateThumbnail(inputPath, thumbnailPath);

    const thumbnailKey = `videos/${message.userId}/${message.videoId}/thumbnail.jpg`;

    await uploadFile(thumbnailPath, thumbnailKey, 'image/jpeg');

    const resolutions = [
      { type: '1080p', progress: 30 },
      { type: '720p', progress: 50 },
      { type: '480p', progress: 70 },
    ] as const;

    for (const resolution of resolutions) {
      await updateVideoProgress(message.videoId, resolution.progress, 'Transcoding video');
      const outputDirectory = path.join(workDirectory, resolution.type);

      await transcodeToHls(
        inputPath,
        outputDirectory,
        resolution.type,
        metadata.width,
        metadata.height,
      );

      await uploadDirectory(
        outputDirectory,
        `videos/${message.userId}/${message.videoId}/hls/${resolution.type}`,
      );
    }

    await updateVideoProgress(message.videoId, 95, 'Save processed video');

    // Create the master playlist referencing the three variant playlists.
    const masterPlaylist = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080',
      '1080p/index.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720',
      '720p/index.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=1200000,RESOLUTION=854x480',
      '480p/index.m3u8',
    ].join('\n');

    const masterPath = path.join(workDirectory, 'master.m3u8');
    const { writeFile } = await import('fs/promises');
    await writeFile(masterPath, masterPlaylist);

    const masterKey = `videos/${message.userId}/${message.videoId}/hls/master.m3u8`;

    await uploadFile(masterPath, masterKey, 'application/vnd.apple.mpegurl');

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE videos
         SET duration_seconds = $1,
             width = $2,
             height = $3,
             codec = $4,
             thumbnail_object_key = $5,
             hls_master_playlist_key = $6,
             status = 'ready',
             updated_at = NOW()
         WHERE id = $7`,
        [
          metadata.duration,
          metadata.width,
          metadata.height,
          metadata.codec,
          thumbnailKey,
          masterKey,
          message.videoId,
        ],
      );

      await client.query(
        `UPDATE processing_jobs
         SET status = 'completed',
             progress = 100,
             completed_at = NOW()
         WHERE id = $1`,
        [message.jobId],
      );
    });

    await updateVideoProgress(message.videoId, 100, 'Processing completed', 'ready');
  } catch (error) {
    await pool.query(`UPDATE videos SET status = 'failed' WHERE id = $1`, [message.videoId]);

    await updateVideoProgress(message.videoId, 0, 'Processing failed', 'failed');

    throw error;
  } finally {
    await rm(workDirectory, { recursive: true, force: true });
  }
};
