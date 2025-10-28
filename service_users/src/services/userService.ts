import { userRepository } from '../repositories/userRepository';
import { PublicUser } from '../types';

export const userService = {
  getProfile(userId: string): PublicUser | undefined {
    const user = userRepository.findById(userId);
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  },

  updateProfile(userId: string, data: { name?: string; password_hash?: string }): PublicUser | undefined {
    return userRepository.update(userId, {
      name: data.name,
      password_hash: data.password_hash,
      updated_at: new Date().toISOString(),
    });
  },

  listUsers(params: { limit: number; offset: number; role?: string; search?: string }) {
    return userRepository.list(params);
  },
};

