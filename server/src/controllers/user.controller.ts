import { responseHandler } from "@/utils/responseHandler";
import type { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { AppError } from "@/utils/app.error";

export const getCurrentUser = async (
  req: Request,
  res: Response,
) => {
  if (!req.auth) {
    throw new AppError("Unauthorized context missing", 401);
  }
  const { userId } = req.auth;

  const user = await UserService.getCurrentUser(userId);

  responseHandler(res, 200, "Current user retrieved successfully", { user });
};