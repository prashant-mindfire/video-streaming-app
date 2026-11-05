import { pool } from "../config/db";
import type { CreateUserInput } from "../models/user.model.ts";

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  return result.rows[0] ?? null;
};

export const createUser = async (user: CreateUserInput) => {
  const result = await pool.query(
    `INSERT INTO users (
      id, name, email, password_hash
    )
    VALUES (gen_random_uuid(), $1, $2, $3)
    RETURNING id, name, email, role, created_at`,
    [user.name, user.email, user.password_hash]
  );

  return result.rows[0];
};

export const createSession = async (
  userId: string,
  expiresAt: Date
): Promise<any> => {
  const result = await pool.query<any>(
    `INSERT INTO auth_sessions (
      user_id,
      expires_at
    )
    VALUES ($1, $2)
    RETURNING *`,
    [userId, expiresAt]
  );

  return result.rows[0];
};

export const findActiveSession = async (
  sessionId: string,
  userId: string
): Promise<any | null> => {
  const result = await pool.query<any>(
    `SELECT *
     FROM auth_sessions
     WHERE id = $1
       AND user_id = $2
       AND revoked_at IS NULL
       AND expires_at > NOW()`,
    [sessionId, userId]
  );

  return result.rows[0] ?? null;
};

export const revokeSession = async (
  sessionId: string
): Promise<void> => {
  await pool.query(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE id = $1
       AND revoked_at IS NULL`,
    [sessionId]
  );
};