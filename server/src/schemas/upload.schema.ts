import z from 'zod';

export const initiateUploadSchema = z.object({
  body: z.object({
    fileName: z.string().trim().min(1, 'File name is required').max(500),
    contentType: z.string().trim().min(1, 'Content type is required').max(150),
    fileSize: z.number().int().positive().safe(),
  }),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>['body'];

export const generatePartUrlsSchema = z.object({
  body: z.object({
    partNumbers: z.array(z.number().int().positive()).min(1).max(100),
  }),
});

export type GeneratePartUrlsInput = z.infer<typeof generatePartUrlsSchema>['body'];

export const completeUploadSchema = z.object({
  body: z.object({
    parts: z
      .array(
        z.object({
          partNumber: z.number().int().positive(),
          etag: z.string().min(1),
        }),
      )
      .min(1),
  }),
});

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>['body'];

export const getUploadParamsSchema = z.object({
  params: z.object({
    uploadId: z.uuid().min(1, 'uploadId is required'),
  }),
});

export type GetUploadParamsInput = z.infer<typeof getUploadParamsSchema>['params'];
