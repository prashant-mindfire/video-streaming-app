import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import { responseHandler } from "@/utils/responseHandler";
import type { LoginUserInput, RegisterUserInput } from "@/schemas/auth.schema";
import { AppError } from "@/utils/app.error";
import { cookieOptions } from "@/utils/cookie";
import { SESSION_DURATION_DAYS } from "@/utils/constants";

export const registerUser = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
): Promise<void> => {
  const { name, email, password, role } = req.body;

  const user = await AuthService.registerUser(
    name,
    email,
    password,
    role
  );

  responseHandler(res, 201, "User registered successfully", { user });
};

export const loginUser = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
): Promise<void> => {
    const { email, password } = req.body;

    const result = await AuthService.loginUser(email, password);

    res.cookie("session", result.token, {
      ...cookieOptions,
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    });

    responseHandler(res, 200, "Login successful", {
      user: result.user,
      session: result.session,
    });
};

export const logoutUser = async (
  req: Request,
  res: Response,
) => {
    if (!req.auth) {
      throw new AppError("Unauthorized context missing", 401);
    }
    const { sessionId } = req.auth;

    await AuthService.logoutUser(sessionId);
    res.clearCookie("session", cookieOptions);

    responseHandler(res, 200, "Logout successful", {});
};