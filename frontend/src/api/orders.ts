import { apiClient } from './client';
import { mapOrder } from '../utils/mappers';
import type { ApiResponse } from '../types/api';
import type { Order, OrderStatus, Paginated } from '../types/order';

export interface ListOrdersParams {
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
  status?: OrderStatus | 'all';
  userId?: string;
}

export interface CreateOrderPayload {
  userId: string;
  totalAmount: number;
  metadata?: Record<string, unknown>;
}

export const ordersApi = {
  async listOrders(params: ListOrdersParams = {}, signal?: AbortSignal): Promise<Paginated<Order>> {
    const query: Record<string, string | number> = {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      sort: params.sort ?? 'desc',
    };

    if (params.status && params.status !== 'all') {
      query.status = params.status;
    }

    if (params.userId) {
      query.userId = params.userId;
    }

    const { data } = await apiClient.get<ApiResponse<{ total: number; items: any[] }>>('/orders', {
      params: query,
      signal,
    });

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return {
      total: data.data.total,
      items: data.data.items.map(mapOrder),
    };
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post<ApiResponse<any>>('/orders', {
      userId: payload.userId,
      totalAmount: payload.totalAmount,
      metadata: payload.metadata,
    });

    if (!data.success) {
      throw new Error(data.error.message);
    }

    return mapOrder(data.data);
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await apiClient.patch<ApiResponse<any>>(`/orders/${id}/status`, { status });
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return mapOrder(data.data);
  },

  async cancel(id: string): Promise<Order> {
    const { data } = await apiClient.delete<ApiResponse<any>>(`/orders/${id}`);
    if (!data.success) {
      throw new Error(data.error.message);
    }
    return mapOrder(data.data);
  },
};

