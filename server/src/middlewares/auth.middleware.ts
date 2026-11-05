import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import * as AuthRepository from "../repositories/auth.repository";
import { AppError } from "../utils/app.error";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.session;
  if (!token) throw new AppError("Authentication required", 401);

  // Calls our safe function. No try/catch needed here anymore!
  const decoded = verifyToken(token); 
  
  if (!decoded || !decoded.sub || !decoded.sid) {
    throw new AppError("Invalid or expired authentication token", 401);
  }

  // Express 5 natively catches any database errors thrown here!
  const session = await AuthRepository.findActiveSession(decoded.sid, decoded.sub);
  if (!session) throw new AppError("Session expired or revoked", 401);

  req.auth = {
    userId: decoded.sub,
    sessionId: decoded.sid,
  };

  return next();
};
