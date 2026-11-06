import z from "zod";

export const initiateUploadSchema = z.object({
    body: z.object({
        fileName: z.string().trim().min(1).max(500),
        contentType: z.string().trim().min(1).max(150),
        fileSize: z.number().int().positive().safe(),
    }),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>['body'];
