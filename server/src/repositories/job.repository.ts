import { randomUUID } from 'crypto';
import type { PgClient } from '@/utils/withTransaction';

export const createVideoProcessingJob = async (
  client: PgClient,
  videoId: string,
): Promise<string> => {
  const jobId = randomUUID();

  await client.query(
    `INSERT INTO processing_jobs (
      id,
      video_id,
      job_type,
      status
    )
    VALUES ($1, $2, 'video_processing', 'queued')`,
    [jobId, videoId],
  );

  return jobId;
};
