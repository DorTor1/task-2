import request from 'supertest';
import app from '../../src/app';
import { orderService } from '../../src/services/orderService';
import { signTestToken } from '../helpers/auth';

jest.mock('../../src/services/userClient', () => ({
  userClient: {
    ensureUserExists: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('PATCH /v1/orders/:id/status', () => {
  const userId = 'order-owner';
  const userToken = signTestToken({ sub: userId, email: 'owner@example.com', role: 'user' });
  const adminToken = signTestToken({ sub: 'admin-id', email: 'admin@example.com', role: 'admin' });
  let orderId: string;

  beforeEach(() => {
    const order = orderService.createOrder({
      userId,
      totalAmount: 500,
      metadata: { createdBy: 'test' },
    });
    orderId = order.id;
  });

  it('позволяет владельцу обновить статус своего заказа', async () => {
    const response = await request(app)
      .patch(`/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'completed' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('completed');
  });

  it('позволяет администратору обновить чужой заказ', async () => {
    const response = await request(app)
      .patch(`/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelled' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('cancelled');
  });

  it('возвращает 403, если пользователь пытается изменить чужой заказ', async () => {
    const otherToken = signTestToken({ sub: 'other-user', email: 'other@example.com', role: 'user' });
    const response = await request(app)
      .patch(`/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ status: 'completed' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});

