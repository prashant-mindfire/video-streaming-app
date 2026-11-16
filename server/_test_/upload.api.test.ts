import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as UploadService from '@/services/upload.service';
import { initiateUpload } from '@/controllers/upload.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import { initiateUploadSchema } from '@/schemas/upload.schema';
import { UserRole } from '@/types/user';
import { UploadStatus } from '@/models/upload.model';

vi.mock('@/services/upload.service', () => ({
  initiateUpload: vi.fn(),
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
    expect(response.body.data.data).toEqual(uploadResult);
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
