import crypto from 'crypto';
import { redis } from '../config/redis'; // Your Redis client instance
import { PLAYBACK_TTL_SECONDS } from '@/utils/constants';

interface CreatePlaybackAccessParams {
  videoId: string;
  userId: string;
  masterPlaylistKey: string;
}

export interface PlaybackAccessResponse {
  playbackToken: string;
  streamUrl: string;
  expiresIn: number;
  expiresAt: Date;
}

export const createPlaybackAccess = async ({
  videoId,
  userId,
  masterPlaylistKey,
}: CreatePlaybackAccessParams): Promise<PlaybackAccessResponse> => {
  // Generate a cryptographically secure random session token
  const playbackToken = crypto.randomBytes(32).toString('hex');

  // This allows authorizing both the master playlist and all .ts/.m4s segments inside that folder
  const hlsBasePrefix = masterPlaylistKey.substring(0, masterPlaylistKey.lastIndexOf('/'));

  // Store session details in Redis with automatic expiration (EX)
  const redisKey = `playback:session:${playbackToken}`;
  const sessionPayload = JSON.stringify({
    videoId,
    userId,
    masterPlaylistKey,
    hlsBasePrefix,
  });

  await redis.set(redisKey, sessionPayload, 'EX', PLAYBACK_TTL_SECONDS);

  // Calculate exact expiration timestamp for the client player
  const expiresAt = new Date(Date.now() + PLAYBACK_TTL_SECONDS * 1000);

  return {
    playbackToken,
    streamUrl: `/api/${process.env.API_VERSION}/stream/${playbackToken}/master.m3u8`,
    expiresIn: PLAYBACK_TTL_SECONDS,
    expiresAt,
  };
};
