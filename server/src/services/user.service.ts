import { AppError } from '@/utils/app.error';
import * as UserRepository from '../repositories/user.repository';

export const getCurrentUser = async (userId: string) => {
  const user = await UserRepository.findUserById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
