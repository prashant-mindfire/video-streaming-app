import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as VideoService from '@/services/video.service';
import * as VideoController from '@/controllers/video.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import { getVideoParamsSchema, listVideosSchema } from '@/schemas/video.schema';
import { UserRole } from '@/types/user';

vi.mock('@/services/video.service', () => ({
  listVideos: vi.fn(),
  getVideo: vi.fn(),
  deleteVideo: vi.fn(),
  getProcessingStatus: vi.fn(),
  createVideoPlaybackSession: vi.fn(),
  getVideoDownloadLink: vi.fn(),
}));

const authenticateTestUser = (req: Request, _res: Response, next: NextFunction) => {
  req.auth = {
    userId: 'owner-id',
    sessionId: 'session-id',
    role: UserRole.USER,
  };
  next();
};

const app = express();
const jsonParser = express.json();
app.get(
  '/videos',
  jsonParser,
  authenticateTestUser,
  validateRequest(listVideosSchema),
  VideoController.getVideos,
);
app.get(
  '/videos/:videoId',
  jsonParser,
  authenticateTestUser,
  validateRequest(getVideoParamsSchema),
  VideoController.getVideo,
);
app.delete(
  '/videos/:videoId',
  jsonParser,
  authenticateTestUser,
  validateRequest(getVideoParamsSchema),
  VideoController.deleteVideo,
);
app.post(
  '/videos/:videoId/playback-sessions',
  jsonParser,
  authenticateTestUser,
  validateRequest(getVideoParamsSchema),
  VideoController.createPlaybackSession,
);

const videosResult = {
  videos: [],
  page: 3,
  limit: 4,
  total: 0,
  totalPages: 0,
};
const videoId = '123e4567-e89b-42d3-a456-426614174000';

describe('video API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VideoService.listVideos).mockResolvedValue(videosResult);
    vi.mocked(VideoService.getVideo).mockResolvedValue({
      id: videoId,
      title: 'Clip',
      status: 'ready',
      metadata: { fileSize: 1024 },
      thumbnailObjectKey: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: null,
    });
    vi.mocked(VideoService.deleteVideo).mockResolvedValue(undefined);
    vi.mocked(VideoService.createVideoPlaybackSession).mockResolvedValue({
      streamUrl: 'https://stream.example/session/master.m3u8',
    });
  });

  it('passes validated filters and pagination through to the video service', async () => {
    await request(app)
      .get('/videos?page=3&pageSize=4&search=lecture&status=ready&sortBy=oldest')
      .expect(200);

    expect(VideoService.listVideos).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'owner-id',
        page: 3,
        pageSize: 4,
        search: 'lecture',
        status: 'ready',
        sortBy: 'oldest',
      }),
    );
  });

  it('scopes detail, deletion, and playback requests to the authenticated user', async () => {
    const detailResponse = await request(app).get(`/videos/${videoId}`).expect(200);
    expect(detailResponse.body.data.id).toBe(videoId);
    expect(VideoService.getVideo).toHaveBeenCalledWith(videoId, 'owner-id');

    await request(app).delete(`/videos/${videoId}`).expect(200);
    expect(VideoService.deleteVideo).toHaveBeenCalledWith(videoId, 'owner-id');

    const playbackResponse = await request(app)
      .post(`/videos/${videoId}/playback-sessions`)
      .expect(201);
    expect(playbackResponse.body.data.streamUrl).toContain('/session/master.m3u8');
    expect(VideoService.createVideoPlaybackSession).toHaveBeenCalledWith(videoId, 'owner-id');
  });
});
