import type { Response } from 'express';

interface ResponseData {
  [key: string]: any;
}

export const responseHandler = (
  res: Response,
  statusCode: number,
  message: string,
  data: ResponseData | null = null,
): Response => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    ...(data || {}),
  });
};
