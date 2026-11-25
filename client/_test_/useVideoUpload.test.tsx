import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeVideoUpload,
  generatePartUploadUrls,
  initiateVideoUpload,
} from '@/lib/api/upload.api';
import { uploadPart } from '@/utils/uploadPart';
import useVideoUpload from '@/hooks/useVideoUpload';

const mocks = vi.hoisted(() => ({
  completeVideoUpload: vi.fn(),
  generatePartUploadUrls: vi.fn(),
  initiateVideoUpload: vi.fn(),
  uploadPart: vi.fn(),
}));

vi.mock('@/lib/api/upload.api', () => ({
  completeVideoUpload: mocks.completeVideoUpload,
  generatePartUploadUrls: mocks.generatePartUploadUrls,
  initiateVideoUpload: mocks.initiateVideoUpload,
}));
vi.mock('@/utils/uploadPart', () => ({ uploadPart: mocks.uploadPart }));

describe('useVideoUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(initiateVideoUpload).mockResolvedValue({ uploadId: 'upload-id', partSize: 2 });
    vi.mocked(generatePartUploadUrls).mockResolvedValue({
      parts: [1, 2, 3].map((partNumber) => ({
        partNumber,
        uploadUrl: `https://storage.example/part/${partNumber}`,
      })),
    });
    vi.mocked(completeVideoUpload).mockResolvedValue({ videoId: 'video-id' });
    vi.mocked(uploadPart).mockImplementation(
      async (url: string, chunk: Blob, onProgress: (loaded: number) => void) => {
        onProgress(chunk.size);
        return `etag-${url.split('/').pop()}`;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uploads chunks and completes with parts sorted by part number', async () => {
    const file = new File(['abcde'], 'clip.mp4', { type: 'video/mp4' });
    const { result } = renderHook(() => useVideoUpload());

    act(() => result.current.addFiles([file]));

    let uploadedVideoIds: string[] = [];
    await act(async () => {
      uploadedVideoIds = await result.current.startUploads();
    });

    expect(uploadedVideoIds).toEqual(['video-id']);
    expect(generatePartUploadUrls).toHaveBeenCalledWith('upload-id', [1, 2, 3]);
    expect(completeVideoUpload).toHaveBeenCalledWith('upload-id', {
      parts: [
        { partNumber: 1, etag: 'etag-1' },
        { partNumber: 2, etag: 'etag-2' },
        { partNumber: 3, etag: 'etag-3' },
      ],
    });
    expect(result.current.uploads[0]).toMatchObject({
      status: 'uploaded',
      progress: 100,
      videoId: 'video-id',
    });
    expect(result.current.isUploading).toBe(false);
  });

  it('marks a failed part upload and does not complete the multipart upload', async () => {
    vi.mocked(uploadPart).mockImplementation(
      async (url: string, chunk: Blob, onProgress: (loaded: number) => void) => {
        onProgress(chunk.size);
        if (url.endsWith('/1')) throw new Error('Part upload failed');
        return `etag-${url.split('/').pop()}`;
      },
    );

    const file = new File(['abcde'], 'clip.mp4', { type: 'video/mp4' });
    const { result } = renderHook(() => useVideoUpload());

    act(() => result.current.addFiles([file]));
    await act(async () => {
      await result.current.startUploads();
    });

    expect(completeVideoUpload).not.toHaveBeenCalled();
    expect(result.current.uploads[0]).toMatchObject({
      status: 'failed',
      error: 'Part upload failed',
    });
    expect(result.current.isUploading).toBe(false);
  });
});
