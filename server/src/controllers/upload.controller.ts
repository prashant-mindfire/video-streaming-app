import type { InitiateUploadInput } from "@/schemas/upload.schema";
import * as UploadService from "@/services/upload.service";
import { AppError } from "@/utils/app.error";
import { responseHandler } from "@/utils/responseHandler";
import type { Request, Response } from "express";

export const initiateUpload = async (
  req: Request<{}, {}, InitiateUploadInput>,
  res: Response,
) => {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    
    const { fileName, contentType, fileSize } = req.body;

    const result = await UploadService.initiateUpload(
      userId,
      { fileName, contentType, fileSize }
    );

    responseHandler(res, 201, "Upload initiated successfully", {
        data: result
    });
};

export const generatePartUploadUrls = async (
  req: Request,
  res: Response,
) => {
  const userId = req.auth?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { uploadId } = req.params;
  const { partNumbers } = req.body;

  const result =
    await UploadService.generatePartUploadUrls(
      userId,
      uploadId as string,
      partNumbers
    );

  responseHandler(res, 200, "Part upload URLs generated successfully", {
      data: result
  });
};

export const completeUpload = async (
  req: Request,
  res: Response,
) => {
  const { parts } = req.body;

  const result = await UploadService.completeUpload(
    req.auth!.userId,
    req.params.uploadId,
    parts
  );

  responseHandler(res, 200, "Video uploaded successfully", {
    data: result
  });
};