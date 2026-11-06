import type { InitiateUploadInput } from "@/schemas/upload.schema";
import * as UploadService from "@/services/upload.service";
import { AppError } from "@/utils/app.error";
import { responseHandler } from "@/utils/responseHandler";
import type { NextFunction, Request, Response } from "express";

/**
 * POST /api/v1/videos/uploads
 */
export const initiateUpload = async (
  req: Request<{}, {}, InitiateUploadInput>,
  res: Response,
) => {
    const userId = req.auth?.userId;
    const { fileName, contentType, fileSize } = req.body;

    const result = await UploadService.initiateUpload(
      userId,
      { fileName, contentType, fileSize }
    );

    responseHandler(res, 201, "Upload initiated successfully", {
        data: result
    });
};

/**
 * POST /api/v1/videos/uploads/:uploadId/parts/:partNumber/upload-urls
 */
export const generatePartUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    const { uploadId } = req.params;
    const partNumber = Number(req.params.partNumber);

    const result =
      await UploadService.generatePartUploadUrl(
        userId,
        uploadId,
        partNumber
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};