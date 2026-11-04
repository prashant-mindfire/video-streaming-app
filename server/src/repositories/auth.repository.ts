import { pool } from "../config/db.ts";
import { CreateUserInput } from "../models/user.model.ts";

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
): Promise<AuthSession> => {
  const result = await pool.query<AuthSession>(
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