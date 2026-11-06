import { pool } from "@/config/db";
import type { CreateUploadRecordInput, VideoUpload } from "@/models/upload.model";

export const createUpload = async (
  data: CreateUploadRecordInput
) => {
  const query = `
    INSERT INTO video_uploads (
      id,
      user_id,
      original_filename,
      object_key,
      multipart_upload_id,
      file_size,
      content_type,
      part_size,
      total_parts,
      status,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'initiated', $10)
    RETURNING *
  `;

  const values = [
    data.id,
    data.userId,
    data.fileName,
    data.objectKey,
    data.multipartUploadId,
    data.fileSize,
    data.contentType,
    data.partSize,
    data.totalParts,
    data.expiresAt,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] as VideoUpload;
};

export const findUploadByIdAndUserId = async (
  uploadId: string,
  userId: string
): Promise<VideoUpload | null> => {
  const query = `
    SELECT *
    FROM video_uploads
    WHERE id = $1 AND user_id = $2
    LIMIT 1
  `;

  const result = await pool.query(query, [
    uploadId,
    userId,
  ]);

  return result.rows[0] ?? null;
};

export const updateUploadStatus = async (
  uploadId: string,
  status: string
) => {
  const query = `
    UPDATE video_uploads
    SET status = $2
    WHERE id = $1
  `;

  await pool.query(query, [uploadId, status]);
};