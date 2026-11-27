import { pool } from '@/config/db';

export const findByVideoId = async (videoId: string) => {
  const result = await pool.query(
    `
      SELECT
        id,
        language_code,
        label,
        object_key,
        is_default
      FROM video_captions
      WHERE video_id = $1
      ORDER BY is_default DESC, language_code ASC
    `,
    [videoId],
  );

  return result.rows;
};
