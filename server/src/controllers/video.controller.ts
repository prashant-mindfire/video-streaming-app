import type { GetVideoParamsInput, listVideosQueryInput } from "@/schemas/video.schema";
import type { Request, Response } from "express";
import * as VideoService from "@/services/video.service";
import { responseHandler } from "@/utils/responseHandler";

export const getVideos = async (
  req: Request<{}, listVideosQueryInput, {}>,
  res: Response,
) => {
    const queryParams = req.query;

    const result = await VideoService.listVideos({
        userId: req.auth!.userId,
        page: 0,
        limit: 0,
        ...queryParams,
    });

    responseHandler(res, 200, "Videos fetched successfully", {
        data: result
    });
};

export const getVideo = async (
  req: Request<GetVideoParamsInput, {}, {}>,
  res: Response,
) => {
    const { videoId } = req.params;
    const result = await VideoService.getVideo(videoId, req.auth!.userId);

    responseHandler(res, 200, "Video fetched successfully", {
        data: result
    });
};

export const deleteVideo = async (
  req: Request<GetVideoParamsInput, {}, {}>,
  res: Response,
) => {
    const { videoId } = req.params;
    await VideoService.deleteVideo(videoId, req.auth!.userId);

    responseHandler(res, 200, "Video deleted successfully", {});
};

export const getVideoProcessingStatus = async (
  req: Request<GetVideoParamsInput, {}, {}>,
  res: Response,
) => {
    const { videoId } = req.params;
    const status = await VideoService.getProcessingStatus(videoId, req.auth!.userId);

    responseHandler(res, 200, "Video processing status fetched successfully", {
      data: status
    });
};

export const createPlaybackSession = async (
  req: Request<GetVideoParamsInput>,
  res: Response,
) => {
  const { videoId } = req.params;
  const session = await VideoService.createVideoPlaybackSession(
    videoId,
    req.auth!.userId
  );

  responseHandler(res, 201, "Video download URL generated successfully", {
    data: session
  });
};

export const getVideoDownloadLink = async (
  req: Request<GetVideoParamsInput, {}, {}>,
  res: Response
) => {
  const { videoId } = req.params;
  const result = await VideoService.getVideoDownloadLink(
    videoId,
    req.auth!.userId
  );

  responseHandler(res, 200, "Video download URL generated successfully", {
    data: result
  });
};
