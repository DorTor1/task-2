import { apiClient } from './client';
import { mapUser } from '../utils/mappers';
import type { User } from '../types/user';
import type { ApiResponse } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginResult {
  token: string;
  user: User;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const { data } = await apiClient.post<ApiResponse<{ token: string; user: any }>>('/users/login', payload);
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return {
      token: data.data.token,
      user: mapUser(data.data.user),
    };
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<any>>('/users/register', payload);
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return mapUser(data.data);
  },
};

