import { UserRole } from '@/models/user.model';
import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email({ message: 'Invalid email address format' }),
    password: z.string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
  }),
});

export type LoginUserInput = z.infer<typeof loginSchema>['body'];

export const registerSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must be less than 100 characters long'),
    email: z.email({ message: 'Invalid email address format' }),
    password: z.string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    role: z.enum(UserRole, {
      error: 'Invalid role',
    }),
  }),
});

export type RegisterUserInput = z.infer<typeof registerSchema>['body'];
