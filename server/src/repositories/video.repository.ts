import type { PgClient } from "@/utils/withTransaction";
import { randomUUID } from "crypto";

export interface CreateVideoParams {
  userId: string;
  uploadId: string;
  title: string;
  objectKey: string;
  fileSize: string;
}

export const createVideo = async (
  client: PgClient,
  params: CreateVideoParams
): Promise<string> => {
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
    [
      videoId,
      params.userId,
      params.uploadId,
      params.title,
      params.objectKey,
      params.fileSize,
    ]
  );

  return videoId;
};