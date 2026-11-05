import bcrypt from "bcryptjs";
import * as AuthRepository from "../repositories/auth.repository";
import type { User, UserRole } from "@/models/user.model";
import { AppError } from "@/utils/app.error";
import { generateToken } from "@/utils/jwt";
import { comparePassword } from "@/utils/password";
import { SESSION_DURATION_DAYS } from "@/utils/constants";

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<User> => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await AuthRepository.findUserByEmail(
    normalizedEmail
  );

  if (existingUser) {
    throw new AppError("Email address is already registered", 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await AuthRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await AuthRepository.findUserByEmail(
    normalizedEmail
  );

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await AuthRepository.createSession(
    user.id,
    expiresAt
  );

  const token = generateToken(user.id, session.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    session: {
      id: session.id,
      expiresAt: session.expires_at,
    },
  };
};

export const logoutUser = async (
  sessionId: string
): Promise<void> => {
  await AuthRepository.revokeSession(sessionId);
};