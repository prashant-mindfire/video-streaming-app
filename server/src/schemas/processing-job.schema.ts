import z from 'zod';

export const retryJobParamsSchema = z.object({
  params: z.object({
    jobId: z.uuid().min(1, 'jobId is required'),
  }),
});

export type RetryJobParamsInput = z.infer<typeof retryJobParamsSchema>['params'];
