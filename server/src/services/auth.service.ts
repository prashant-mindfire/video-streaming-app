import bcrypt from "bcryptjs";
import * as authRepository from "../repositories/auth.repository";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await authRepository.findUserByEmail(
    normalizedEmail
  );

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await authRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
  });

  return user;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await authRepository.findUserByEmail(
    normalizedEmail
  );

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const sessionId = randomUUID();

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await authRepository.createSession(
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