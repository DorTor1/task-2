import { v4 as uuid } from 'uuid';
import { orderRepository } from '../repositories/orderRepository';
import { Order, PaginatedOrders } from '../types';
import { eventBus } from './eventBus';

export const orderService = {
  createOrder(input: {
    userId: string;
    totalAmount: number;
    metadata?: Record<string, unknown>;
  }): Order {
    const now = new Date().toISOString();
    const order: Order = {
      id: uuid(),
      user_id: input.userId,
      status: 'created',
      total_amount: input.totalAmount,
      metadata: input.metadata,
      created_at: now,
      updated_at: now,
    };

    orderRepository.create(order);

    eventBus.publish({
      type: 'created',
      payload: {
        orderId: order.id,
        userId: order.user_id,
        status: order.status,
      },
    });

    return order;
  },

  getOrder(id: string): Order | undefined {
    return orderRepository.findById(id);
  },

  listOrders(params: {
    userId: string;
    limit: number;
    offset: number;
    sort: 'asc' | 'desc';
    status?: Order['status'];
  }): PaginatedOrders {
    return orderRepository.listByUser(params);
  },

  updateStatus(id: string, status: Order['status']): Order | undefined {
    const order = orderRepository.updateStatus(id, status);
    if (order) {
      eventBus.publish({
        type: 'status_updated',
        payload: {
          orderId: order.id,
          userId: order.user_id,
          status: order.status,
        },
      });
    }
    return order;
  },

  cancelOrder(id: string): Order | undefined {
    const order = orderRepository.cancel(id);
    if (order) {
      eventBus.publish({
        type: 'status_updated',
        payload: {
          orderId: order.id,
          userId: order.user_id,
          status: order.status,
        },
      });
    }
    return order;
  },
};

