import jwt from "jsonwebtoken";
import { AppError } from "./app.error";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  return secret;
};

export const generateToken = (
  userId: string,
  sessionId: string
): string => {
  return jwt.sign(
    { sid: sessionId },
    getJwtSecret(),
    {
      subject: userId,
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (typeof decoded === "string") {
      return null;
    }

    return decoded;
  } catch {
    return null; 
  }
};