import type { LoginRequest, RegisterRequest, User } from '@/types/auth';
import { http } from '../http';

export const registerUser = async (payload: RegisterRequest): Promise<void> => {
  await http.post('/auth/users', payload);
};

export const loginUser = async (credentials: LoginRequest): Promise<void> => {
  await http.post('/auth/sessions', credentials);
};

export const logoutUser = async (): Promise<void> => {
  await http.delete('/auth/sessions/current');
};

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await http.get('/users/me');

  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  const user = payload?.user ?? payload;

  if (user && typeof user === 'object' && 'id' in user) {
    return user as User;
  }

  return null;
};
