import { z } from 'zod';

export const streamAssetSchema = z.object({
  params: z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/i, 'Invalid playback token format'),
    filePath: z.union([z.string().min(1), z.array(z.string().min(1)).nonempty()]).refine((val) => {
      const joined = Array.isArray(val) ? val.join('/') : val;
      return !joined.includes('..') && (joined.endsWith('.m3u8') || joined.endsWith('.ts'));
    }, 'Invalid HLS asset path'),
  }),
});

export type StreamAssetInput = z.infer<typeof streamAssetSchema>['params'];
