import { pool } from '@/config/db';
import type { PublicUser } from '@/models/user.model';

export const findUserById = async (userId: string): Promise<PublicUser | null> => {
  const result = await pool.query<PublicUser>(
    `SELECT
      id,
      name,
      email,
      role,
      created_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  return result.rows[0] ?? null;
};
