import { CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RUSTFS_BUCKET_NAME, s3Client } from '@/config/rustfs';
import * as UploadRepository from '@/repositories/upload.repository';
import { listParts } from '@/utils/multipart-upload';
import { withTransaction } from '@/utils/withTransaction';
import { UploadStatus, type VideoUpload } from '@/models/upload.model';
import { completeUpload } from './upload.service';

const mocks = vi.hoisted(() => ({
  findUploadByIdAndUserId: vi.fn(),
  listParts: vi.fn(),
  send: vi.fn(),
  withTransaction: vi.fn(),
}));

vi.mock('@/config/rustfs', () => ({
  RUSTFS_BUCKET_NAME: 'video-bucket',
  s3Client: { send: mocks.send },
}));
vi.mock('@/repositories/upload.repository', () => ({
  createUpload: vi.fn(),
  findUploadByIdAndUserId: mocks.findUploadByIdAndUserId,
  updateUploadStatus: vi.fn(),
}));
vi.mock('@/repositories/video.repository', () => ({ createVideo: vi.fn() }));
vi.mock('@/repositories/job.repository', () => ({ createVideoProcessingJob: vi.fn() }));
vi.mock('@/repositories/outbox.repository', () => ({ insertOutboxEvent: vi.fn() }));
vi.mock('@/utils/multipart-upload', () => ({
  abortMultipartUpload: vi.fn(),
  createMultipartUpload: vi.fn(),
  generatePartUrls: vi.fn(),
  getPartNumbers: (totalParts: number) =>
    Array.from({ length: totalParts }, (_, index) => index + 1),
  getTotalParts: vi.fn(),
  listParts: mocks.listParts,
}));
vi.mock('@/utils/withTransaction', () => ({ withTransaction: mocks.withTransaction }));

const upload: VideoUpload = {
  id: 'upload-id',
  user_id: 'owner-id',
  original_filename: 'clip.mp4',
  object_key: 'videos/owner-id/upload-id/original/clip.mp4',
  multipart_upload_id: 'multipart-id',
  file_size: '1024',
  content_type: 'video/mp4',
  part_size: '512',
  total_parts: 2,
  status: UploadStatus.INITIATED,
  expires_at: new Date('2027-01-01T00:00:00.000Z'),
  created_at: null,
  completed_at: null,
};

describe('completeUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UploadRepository.findUploadByIdAndUserId).mockResolvedValue(upload);
    vi.mocked(s3Client.send).mockResolvedValue({} as never);
    vi.mocked(withTransaction).mockResolvedValue({ videoId: 'video-id', jobId: 'job-id' });
  });

  it('rejects submissions that omit any expected part before contacting storage', async () => {
    await expect(
      completeUpload('owner-id', 'upload-id', [{ partNumber: 1, etag: 'etag-1' }]),
    ).rejects.toMatchObject({
      message: 'Missing or invalid uploaded parts',
      statusCode: 400,
    });

    expect(listParts).not.toHaveBeenCalled();
    expect(s3Client.send).not.toHaveBeenCalled();
    expect(withTransaction).not.toHaveBeenCalled();
  });

  it('rejects ETags that do not match the stored upload parts', async () => {
    vi.mocked(listParts).mockResolvedValue({
      Parts: [
        { PartNumber: 1, ETag: 'etag-1' },
        { PartNumber: 2, ETag: 'etag-2' },
      ],
      IsTruncated: false,
    } as never);

    await expect(
      completeUpload('owner-id', 'upload-id', [
        { partNumber: 1, etag: 'wrong-etag' },
        { partNumber: 2, etag: 'etag-2' },
      ]),
    ).rejects.toMatchObject({
      message: 'Part 1 is missing or has an invalid ETag',
      statusCode: 400,
    });

    expect(s3Client.send).not.toHaveBeenCalled();
    expect(withTransaction).not.toHaveBeenCalled();
  });

  it('normalizes quoted ETags, follows storage pagination, and then queues processing', async () => {
    vi.mocked(listParts)
      .mockResolvedValueOnce({
        Parts: [{ PartNumber: 1, ETag: '"etag-1"' }],
        IsTruncated: true,
        NextPartNumberMarker: 1,
      } as never)
      .mockResolvedValueOnce({
        Parts: [{ PartNumber: 2, ETag: 'etag-2' }],
        IsTruncated: false,
      } as never);

    const result = await completeUpload('owner-id', 'upload-id', [
      { partNumber: 2, etag: '"etag-2"' },
      { partNumber: 1, etag: 'etag-1' },
    ]);

    expect(listParts).toHaveBeenNthCalledWith(
      1,
      RUSTFS_BUCKET_NAME,
      upload.object_key,
      upload.multipart_upload_id,
      undefined,
    );
    expect(listParts).toHaveBeenNthCalledWith(
      2,
      RUSTFS_BUCKET_NAME,
      upload.object_key,
      upload.multipart_upload_id,
      1,
    );

    const completionCommand = vi.mocked(s3Client.send).mock.calls[0]?.[0] as
      CompleteMultipartUploadCommand | undefined;
    expect(completionCommand?.input.MultipartUpload?.Parts).toEqual([
      { PartNumber: 1, ETag: 'etag-1' },
      { PartNumber: 2, ETag: 'etag-2' },
    ]);
    expect(withTransaction).toHaveBeenCalledOnce();
    expect(vi.mocked(s3Client.send).mock.invocationCallOrder[0]!).toBeLessThan(
      vi.mocked(withTransaction).mock.invocationCallOrder[0]!,
    );
    expect(result).toMatchObject({
      uploadId: 'upload-id',
      videoId: 'video-id',
      jobId: 'job-id',
      status: 'queued',
    });
  });
});
