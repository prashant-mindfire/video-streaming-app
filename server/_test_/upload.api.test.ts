import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as UploadService from '@/services/upload.service';
import {
  completeUpload,
  generatePartUploadUrls,
  initiateUpload,
} from '@/controllers/upload.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import {
  completeUploadSchema,
  generatePartUrlsSchema,
  initiateUploadSchema,
} from '@/schemas/upload.schema';
import { UserRole } from '@/types/user';
import { UploadStatus } from '@/models/upload.model';

vi.mock('@/services/upload.service', () => ({
  initiateUpload: vi.fn(),
  generatePartUploadUrls: vi.fn(),
  completeUpload: vi.fn(),
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
app.use(express.json());
app.post(
  '/videos/uploads',
  authenticateTestUser,
  validateRequest(initiateUploadSchema),
  initiateUpload,
);
app.post(
  ['/videos/uploads/:uploadId/parts/upload-urls', '/uploads/:uploadId/parts/upload-urls'],
  authenticateTestUser,
  validateRequest(generatePartUrlsSchema),
  generatePartUploadUrls,
);
app.post(
  '/videos/uploads/:uploadId/completion',
  authenticateTestUser,
  validateRequest(completeUploadSchema),
  completeUpload,
);

const uploadResult = {
  uploadId: 'upload-id',
  fileName: 'clip.mp4',
  fileSize: 1024,
  partSize: 512,
  totalParts: 2,
  status: UploadStatus.INITIATED,
  parts: [
    {
      partNumber: 1,
      uploadUrl: 'https://storage.example/part/1',
      expiresIn: 900,
    },
  ],
  nextPartNumbers: [2],
};

describe('POST /videos/uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UploadService.initiateUpload).mockResolvedValue(uploadResult);
    vi.mocked(UploadService.generatePartUploadUrls).mockResolvedValue({
      uploadId: 'upload-id',
      parts: uploadResult.parts,
    });
    vi.mocked(UploadService.completeUpload).mockResolvedValue({
      uploadId: 'upload-id',
      videoId: 'video-id',
      jobId: 'job-id',
      status: 'queued',
      message: 'Upload completed and video processing has been queued',
    });
  });

  it('starts an upload for the authenticated user', async () => {
    const response = await request(app)
      .post('/videos/uploads')
      .send({
        fileName: 'clip.mp4',
        contentType: 'video/mp4',
        fileSize: 1024,
      })
      .expect(201);

    expect(response.body.message).toBe('Upload initiated successfully');
    expect(response.body.data).toEqual(uploadResult);
    expect(UploadService.initiateUpload).toHaveBeenCalledWith('owner-id', {
      fileName: 'clip.mp4',
      contentType: 'video/mp4',
      fileSize: 1024,
    });
  });

  it('rejects invalid file sizes before calling the upload service', async () => {
    await request(app)
      .post('/videos/uploads')
      .send({
        fileName: 'clip.mp4',
        contentType: 'video/mp4',
        fileSize: 0,
      })
      .expect(400);

    expect(UploadService.initiateUpload).not.toHaveBeenCalled();
  });
});

describe('POST upload part URLs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UploadService.generatePartUploadUrls).mockResolvedValue({
      uploadId: 'upload-id',
      parts: uploadResult.parts,
    });
  });

  it('generates URLs for requested parts belonging to the authenticated user', async () => {
    const response = await request(app)
      .post('/videos/uploads/upload-id/parts/upload-urls')
      .send({ partNumbers: [1] })
      .expect(200);

    expect(response.body.data.parts).toEqual(uploadResult.parts);
    expect(UploadService.generatePartUploadUrls).toHaveBeenCalledWith('owner-id', 'upload-id', [1]);
  });

  it('continues to support the legacy upload URL path', async () => {
    await request(app)
      .post('/uploads/upload-id/parts/upload-urls')
      .send({ partNumbers: [1] })
      .expect(200);

    expect(UploadService.generatePartUploadUrls).toHaveBeenCalledWith('owner-id', 'upload-id', [1]);
  });

  it('rejects empty part lists before calling the service', async () => {
    await request(app)
      .post('/videos/uploads/upload-id/parts/upload-urls')
      .send({ partNumbers: [] })
      .expect(400);

    expect(UploadService.generatePartUploadUrls).not.toHaveBeenCalled();
  });
});

describe('POST /videos/uploads/:uploadId/completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(UploadService.completeUpload).mockResolvedValue({
      uploadId: 'upload-id',
      videoId: 'video-id',
      jobId: 'job-id',
      status: 'queued',
      message: 'Upload completed and video processing has been queued',
    });
  });

  it('completes the authenticated user upload with its part ETags', async () => {
    const parts = [{ partNumber: 1, etag: 'etag-1' }];
    const response = await request(app)
      .post('/videos/uploads/upload-id/completion')
      .send({ parts })
      .expect(200);

    expect(response.body.data.videoId).toBe('video-id');
    expect(UploadService.completeUpload).toHaveBeenCalledWith('owner-id', 'upload-id', parts);
  });

  it('rejects empty part lists before calling the service', async () => {
    await request(app).post('/videos/uploads/upload-id/completion').send({ parts: [] }).expect(400);

    expect(UploadService.completeUpload).not.toHaveBeenCalled();
  });
});
