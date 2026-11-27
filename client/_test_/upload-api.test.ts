import { beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from '@/lib/http';
import { generatePartUploadUrls } from '@/lib/api/upload.api';

vi.mock('@/lib/http', () => ({
  http: {
    post: vi.fn(),
  },
}));

describe('generatePartUploadUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the canonical video upload route', async () => {
    const responseData = { uploadId: 'upload-id', parts: [] };
    vi.mocked(http.post).mockResolvedValue({ data: { data: responseData } } as never);

    const result = await generatePartUploadUrls('upload-id', [1, 2]);

    expect(http.post).toHaveBeenCalledWith('/videos/uploads/upload-id/parts/upload-urls', {
      partNumbers: [1, 2],
    });
    expect(result).toEqual(responseData);
  });
});
