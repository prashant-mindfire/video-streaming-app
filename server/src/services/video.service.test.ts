import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as VideoRepository from '@/repositories/video.repository';
import { listVideos } from './video.service';

vi.mock('@/repositories/video.repository', () => ({
  findVideos: vi.fn(),
}));
vi.mock('@/utils/multipart-upload', () => ({
  deleteVideoObjects: vi.fn(),
  downloadVideo: vi.fn(),
}));
vi.mock('./video-progress.service', () => ({ getVideoProgress: vi.fn() }));
vi.mock('./playback-access.service', () => ({ createPlaybackAccess: vi.fn() }));

describe('listVideos sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(VideoRepository.findVideos).mockResolvedValue({ videos: [], total: 0 });
  });

  it.each([
    ['newest', 'created_at', 'DESC'],
    ['oldest', 'created_at', 'ASC'],
    ['title', 'title', 'ASC'],
  ] as const)(
    'maps %s to an allowlisted repository sort',
    async (sortBy, expectedSortBy, expectedSortOrder) => {
      await listVideos({ userId: 'user-id', page: 1, pageSize: 12, sortBy });

      expect(VideoRepository.findVideos).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: expectedSortBy, sortOrder: expectedSortOrder }),
      );
    },
  );
});
