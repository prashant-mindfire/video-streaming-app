import type { UserRole } from '@/types/user';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password_hash: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
}
