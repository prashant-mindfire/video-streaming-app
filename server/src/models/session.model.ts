export interface AuthSession {
  id: string;
  user_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface CreateSessionInput {
  user_id: string;
  expires_at: Date;
}