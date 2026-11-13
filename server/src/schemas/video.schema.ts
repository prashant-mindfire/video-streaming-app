import z from 'zod';

export const listVideosSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    status: z.enum(['queued', 'processing', 'ready', 'failed']).optional(),
    sortBy: z.enum(['created_at', 'title', 'file_size']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export type listVideosQueryInput = z.infer<typeof listVideosSchema>['query'];

export const getVideoParamsSchema = z.object({
  params: z.object({
    videoId: z.uuid().min(1, 'videoId is required'),
  }),
});

export type GetVideoParamsInput = z.infer<typeof getVideoParamsSchema>['params'];
