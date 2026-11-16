import z from 'zod';

const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const listVideosSchema = z.object({
  query: z.object({
    page: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).default(1)),
    pageSize: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(100).default(10)),
    search: z
      .string()
      .trim()
      .transform((value) => value || undefined)
      .optional(),
    status: z.preprocess(
      blankToUndefined,
      z.enum(['queued', 'processing', 'ready', 'failed']).optional(),
    ),
    sortBy: z.preprocess(
      blankToUndefined,
      z.enum(['newest', 'oldest', 'title', 'created_at', 'file_size']).optional(),
    ),
    sortOrder: z.preprocess(blankToUndefined, z.enum(['asc', 'desc']).optional()),
  }),
});

export type listVideosQueryInput = z.infer<typeof listVideosSchema>['query'];

export const getVideoParamsSchema = z.object({
  params: z.object({
    videoId: z.uuid().min(1, 'videoId is required'),
  }),
});

export type GetVideoParamsInput = z.infer<typeof getVideoParamsSchema>['params'];
