import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthRepository from '@/repositories/auth.repository';
import * as DashboardService from '@/services/dashboard.service';
import { getDashboardOverview } from '@/controllers/dashboard.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { authorizeRoles } from '@/middlewares/role.middleware';
import type { DashboardOverview } from '@/types/dashboard';
import { AppError } from '@/utils/app.error';
import { UserRole } from '@/types/user';
import { generateToken } from '@/utils/jwt';

vi.mock('@/repositories/auth.repository', () => ({
  findActiveSession: vi.fn(),
}));

vi.mock('@/services/dashboard.service', () => ({
  getDashboardOverview: vi.fn(),
}));

const app = express();
app.use(cookieParser());
app.get(
  '/admin/dashboard/overview',
  authenticate,
  authorizeRoles(UserRole.ADMIN),
  getDashboardOverview,
);
app.use(
  (
    error: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    res.status(error.statusCode).json({ message: error.message });
  },
);

const overview: DashboardOverview = {
  videos: { total: 3, ready: 3, processing: 0, failed: 0 },
  uploads: { total: 6 },
  processingJobs: { queued: 0, running: 0, failed: 0 },
  storage: { totalBytes: 93_924_908 },
  engagement: { totalViews: 0, totalDownloads: 0 },
  averageProcessingTimeSeconds: 1482.07,
};

let sessionRole: UserRole;

describe('GET /admin/dashboard/overview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'dashboard-api-test-secret';
    sessionRole = UserRole.ADMIN;

    vi.mocked(AuthRepository.findActiveSession).mockImplementation(
      async (sessionId, userId) => ({
        id: sessionId,
        user_id: userId,
        expires_at: new Date('2027-01-01T00:00:00.000Z'),
        revoked_at: null,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        role: sessionRole,
      }),
    );
    vi.mocked(DashboardService.getDashboardOverview).mockResolvedValue(overview);
  });

  const getOverview = (userId = 'admin-id', sessionId = 'session-id') => {
    const token = generateToken(userId, sessionId);

    return request(app)
      .get('/admin/dashboard/overview')
      .set('Cookie', `session=${token}`);
  };

  it('returns dashboard metrics for an authenticated admin', async () => {
    const response = await getOverview().expect(200);

    expect(response.body.data.data).toEqual(overview);
    expect(AuthRepository.findActiveSession).toHaveBeenCalledWith(
      'session-id',
      'admin-id',
    );
    expect(DashboardService.getDashboardOverview).toHaveBeenCalledOnce();
  });

  it('denies access to authenticated users without the admin role', async () => {
    sessionRole = UserRole.USER;

    await getOverview('user-id').expect(403);

    expect(DashboardService.getDashboardOverview).not.toHaveBeenCalled();
  });

  it('requires an authenticated session', async () => {
    const response = await request(app)
      .get('/admin/dashboard/overview')
      .expect(401);

    expect(response.body.message).toBe('Authentication required');
  });
});
