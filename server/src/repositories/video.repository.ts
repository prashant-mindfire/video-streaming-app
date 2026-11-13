import type { PgClient } from '@/utils/withTransaction';
import { randomUUID } from 'crypto';
import { pool } from '@/config/db';

export interface CreateVideoParams {
  userId: string;
  uploadId: string;
  title: string;
  objectKey: string;
  fileSize: string;
}

export interface FindVideosParams {
  userId: string;
  search?: string;
  status?: string;
  page: number;
  limit: number;
  sortBy: 'created_at' | 'title' | 'file_size';
  sortOrder: 'ASC' | 'DESC';
}

export const createVideo = async (client: PgClient, params: CreateVideoParams): Promise<string> => {
  const videoId = randomUUID();

  await client.query(
    `INSERT INTO videos (
      id,
      user_id,
      upload_id,
      title,
      original_object_key,
      file_size,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'queued')`,
    [videoId, params.userId, params.uploadId, params.title, params.objectKey, params.fileSize],
  );

  return videoId;
};

export const findVideos = async (params: FindVideosParams) => {
  const { userId, search, status, page, limit, sortBy, sortOrder } = params;

  const conditions: string[] = ['user_id = $1'];
  const values: unknown[] = [userId];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  // sortBy and sortOrder are allowlisted by the service/controller.
  const videosQuery = `
    SELECT
      id,
      title,
      description,
      thumbnail_object_key,
      duration_seconds,
      width,
      height,
      codec,
      file_size,
      status,
      created_at
    FROM videos
    WHERE ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM videos
    WHERE ${whereClause}
  `;

  const [videosResult, countResult] = await Promise.all([
    pool.query(videosQuery, [...values, limit, offset]),
    pool.query(countQuery, values),
  ]);

  return {
    videos: videosResult.rows,
    total: Number(countResult.rows[0].total),
  };
};

export const findVideoById = async (videoId: string, userId: string) => {
  const result = await pool.query(
    `SELECT
       id,
       title,
       description,
       status,
       duration_seconds,
       width,
       height,
       codec,
       file_size,
       original_object_key,
       thumbnail_object_key,
       hls_master_playlist_key,
       created_at,
       updated_at
     FROM videos
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [videoId, userId],
  );

  return result.rows[0] ?? null;
};

export const deleteVideo = async (videoId: string, userId: string) => {
  await pool.query(
    `DELETE FROM videos
     WHERE id = $1 AND user_id = $2`,
    [videoId, userId],
  );
};

export const findVideoProcessingStatus = async (videoId: string, userId: string) => {
  const result = await pool.query(
    `SELECT
       v.id AS video_id,
       v.status AS video_status,
       pj.status AS job_status,
       pj.progress,
       pj.last_error,
       pj.updated_at
     FROM videos v
     LEFT JOIN processing_jobs pj
       ON pj.video_id = v.id
     WHERE v.id = $1
       AND v.user_id = $2
     ORDER BY pj.created_at DESC
     LIMIT 1`,
    [videoId, userId],
  );

  return result.rows[0] ?? null;
};

export const findVideoForPlayback = async (videoId: string, userId: string) => {
  const result = await pool.query(
    `SELECT id, status, hls_master_playlist_key
     FROM videos
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [videoId, userId],
  );

  return result.rows[0] ?? null;
};
