import type { Request, Response } from 'express';
import { pipeline } from 'stream/promises';
import * as StreamService from '@/services/stream.service';
import type { StreamAssetInput } from '@/schemas/stream-asset.schema';

export const streamHlsAsset = async (req: Request<StreamAssetInput>, res: Response) => {
  const { stream, contentType, contentLength, cacheControl } =
    await StreamService.getHlsAssetStream(req.params.token, req.params.filePath);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControl);

  if (contentLength !== undefined) {
    res.setHeader('Content-Length', contentLength);
  }

  await pipeline(stream, res);
};
