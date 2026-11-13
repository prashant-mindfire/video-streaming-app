import type { VideoMetadata } from '@/types/processing';
import { RESOLUTION_DIMENSIONS } from '@/utils/constants';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import path from 'path';

const runCommand = (command: string, args: string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('error', reject);

    process.on('close', (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `${command} failed: ${code}`));
    });
  });

export const extractMetadata = async (inputPath: string): Promise<VideoMetadata> => {
  const output = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration:stream=codec_type,codec_name,width,height',
    '-of',
    'json',
    inputPath,
  ]);

  const data = JSON.parse(output);

  const videoStream = data.streams?.find(
    (stream: { codec_type: string }) => stream.codec_type === 'video',
  );

  if (!videoStream) {
    throw new Error('No video stream found');
  }

  return {
    duration: Math.round(Number(data.format?.duration || 0)),
    width: Number(videoStream.width || 0),
    height: Number(videoStream.height || 0),
    codec: videoStream.codec_name || 'unknown',
  };
};

export const generateThumbnail = async (inputPath: string, outputPath: string) => {
  await runCommand('ffmpeg', [
    '-y',
    '-ss',
    '00:00:03',
    '-i',
    inputPath,
    '-frames:v',
    '1',
    '-q:v',
    '2',
    outputPath,
  ]);
};

export const transcodeToHls = async (
  inputPath: string,
  outputDirectory: string,
  resolution: '1080p' | '720p' | '480p',
  width: number,
  height: number,
) => {
  await mkdir(outputDirectory, { recursive: true });

  const { maxWidth, maxHeight } = RESOLUTION_DIMENSIONS[resolution];
  const outputPlaylist = path.join(outputDirectory, 'index.m3u8');

  await runCommand('ffmpeg', [
    '-y',
    '-i',
    inputPath,
    '-vf',
    `scale=w='min(${width},${maxWidth})':h='min(${height},${maxHeight})':force_original_aspect_ratio=decrease:force_divisible_by=2`,
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    path.join(outputDirectory, 'segment_%03d.ts'),
    outputPlaylist,
  ]);

  return outputPlaylist;
};
