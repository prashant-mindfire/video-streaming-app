import * as ProcessingJobRepository from '@/repositories/processing-job.repository';
import { AppError } from '@/utils/app.error';
import { RETRY_PROCESSING_JOB_STATUS } from '@/utils/constants';
import { withTransaction } from '@/utils/withTransaction';

export const retryProcessingJob = async (jobId: string) => {
  const job = await withTransaction(async (client) => {
    const processingJob = await ProcessingJobRepository.findProcessingJobForUpdate(client, jobId);

    if (!processingJob) {
      throw new AppError('Processing job not found', 404);
    }

    if (!RETRY_PROCESSING_JOB_STATUS.includes(processingJob.status)) {
      throw new AppError(`Cannot retry job with status '${job.status}'`, 409);
    }

    await ProcessingJobRepository.resetProcessingJobForRetry(client, processingJob.id);

    await ProcessingJobRepository.resetVideoForRetry(client, processingJob.video_id);

    await ProcessingJobRepository.createProcessingOutboxEvent(client, processingJob);

    return processingJob;
  });

  return {
    jobId: job.id,
    videoId: job.video_id,
    status: 'queued',
    message: 'Processing job queued for retry',
  };
};
