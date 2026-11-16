import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthService from '@/services/auth.service';
import { registerUser } from '@/controllers/auth.controller';
import { validateRequest } from '@/middlewares/validation.middleware';
import { registerSchema } from '@/schemas/auth.schema';
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
