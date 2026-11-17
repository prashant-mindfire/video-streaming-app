import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthService from '@/services/auth.service';
import { loginUser, logoutUser, registerUser } from '@/controllers/auth.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import type { User } from '@/models/user.model';
import { UserRole } from '@/types/user';

vi.mock('@/services/auth.service', () => ({
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
}));

const app = express();
app.use(express.json());
app.post('/auth/users', validateRequest(registerSchema), registerUser);
app.post('/auth/sessions', validateRequest(loginSchema), loginUser);
app.delete(
  '/auth/sessions/current',
  (req: Request, _res: Response, next: NextFunction) => {
    req.auth = {
      userId: 'user-id',
      sessionId: 'session-id',
      role: UserRole.USER,
    };
    next();
  },
  logoutUser,
);

const registeredUser: User = {
  id: 'user-id',
  name: 'Alex Example',
  email: 'alex@example.com',
  password_hash: 'hashed-password',
  role: UserRole.USER,
  created_at: new Date('2026-01-01T00:00:00.000Z'),
  updated_at: new Date('2026-01-01T00:00:00.000Z'),
};

describe('POST /auth/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthService.registerUser).mockResolvedValue(registeredUser);
  });

  it('creates a user account with the user role', async () => {
    const response = await request(app)
      .post('/auth/users')
      .send({
        name: 'Alex Example',
        email: 'alex@example.com',
        password: 'password123',
        role: 'user',
      })
      .expect(201);

    expect(response.body.user.role).toBe(UserRole.USER);
    expect(AuthService.registerUser).toHaveBeenCalledWith(
      'Alex Example',
      'alex@example.com',
      'password123',
      UserRole.USER,
    );
  });

  it('rejects attempts to register with the admin role', async () => {
    await request(app)
      .post('/auth/users')
      .send({
        name: 'Alex Example',
        email: 'alex@example.com',
        password: 'password123',
        role: 'admin',
      })
      .expect(400);

    expect(AuthService.registerUser).not.toHaveBeenCalled();
  });
});

describe('POST /auth/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthService.loginUser).mockResolvedValue({
      token: 'signed-session-token',
      user: {
        id: 'user-id',
        name: 'Alex Example',
        email: 'alex@example.com',
        role: UserRole.USER,
      },
      session: {
        id: 'session-id',
        expiresAt: new Date('2026-12-01T00:00:00.000Z'),
      },
    });
  });

  it('returns the session user and sets the session cookie', async () => {
    const response = await request(app)
      .post('/auth/sessions')
      .send({ email: 'alex@example.com', password: 'password123' })
      .expect(200);

    expect(response.body.user).toMatchObject({ id: 'user-id', role: UserRole.USER });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('session=signed-session-token')]),
    );
    expect(AuthService.loginUser).toHaveBeenCalledWith('alex@example.com', 'password123');
  });
});

describe('DELETE /auth/sessions/current', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthService.logoutUser).mockResolvedValue(undefined);
  });

  it('revokes the authenticated session and clears its cookie', async () => {
    const response = await request(app).delete('/auth/sessions/current').expect(200);

    expect(AuthService.logoutUser).toHaveBeenCalledWith('session-id');
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringMatching(/^session=;/)]),
    );
  });
});
