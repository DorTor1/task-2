import { apiClient } from './client';
import { mapUser } from '../utils/mappers';
import type { ApiResponse } from '../types/api';
import type { User, UsersListResult, UserRole } from '../types/user';

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
}

export interface ListUsersParams {
  limit?: number;
  offset?: number;
  role?: UserRole | 'all';
  search?: string;
}

export const usersApi = {
  async fetchProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<any>>('/users/me');
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return mapUser(data.data);
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await apiClient.patch<ApiResponse<any>>('/users/me', payload);
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return mapUser(data.data);
  },

  async listUsers(params: ListUsersParams = {}): Promise<UsersListResult> {
    const query: Record<string, string | number> = {};
    if (typeof params.limit === 'number') {
      query.limit = params.limit;
    }
    if (typeof params.offset === 'number') {
      query.offset = params.offset;
    }
    if (params.role && params.role !== 'all') {
      query.role = params.role;
    }
    if (params.search) {
      query.search = params.search;
    }

    const { data } = await apiClient.get<ApiResponse<{ total: number; items: any[] }>>('/users', { params: query });
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return {
      total: data.data.total,
      items: data.data.items.map(mapUser),
    };
  },
};

