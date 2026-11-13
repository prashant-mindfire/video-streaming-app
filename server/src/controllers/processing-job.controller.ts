import type { RetryJobParamsInput } from '@/schemas/processing-job.schema';
import { responseHandler } from '@/utils/responseHandler';
import type { Request, Response } from 'express';
import * as ProcessingJobService from '@/services/processing-job.service';

export const retryProcessingJob = async (
  req: Request<RetryJobParamsInput, {}, {}>,
  res: Response,
) => {
  const result = await ProcessingJobService.retryProcessingJob(req.params.jobId);

  responseHandler(res, 202, 'Video processing started again', {
    data: result,
  });
};
