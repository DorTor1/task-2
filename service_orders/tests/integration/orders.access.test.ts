import request from 'supertest';
import app from '../../src/app';
import { orderService } from '../../src/services/orderService';
import { signTestToken } from '../helpers/auth';

jest.mock('../../src/services/userClient', () => ({
  userClient: {
    ensureUserExists: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Доступ к заказам', () => {
  const ownerId = 'owner-1';
  const ownerToken = signTestToken({ sub: ownerId, email: 'owner@example.com', role: 'user' });
  const adminToken = signTestToken({ sub: 'admin', email: 'admin@example.com', role: 'admin' });
  let orderId: string;

  beforeEach(() => {
    const order = orderService.createOrder({
      userId: ownerId,
      totalAmount: 1200,
      metadata: { notes: 'initial' },
    });
    orderService.createOrder({ userId: ownerId, totalAmount: 900 });
    orderId = order.id;
  });

  it('возвращает заказ владельцу', async () => {
    const response = await request(app)
      .get(`/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(orderId);
  });

  it('возвращает список заказов с пагинацией', async () => {
    const response = await request(app)
      .get('/v1/orders')
      .query({ limit: 10, offset: 0 })
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(typeof response.body.data.total).toBe('number');
  });

  it('администратор может запросить заказы другого пользователя', async () => {
    const response = await request(app)
      .get('/v1/orders')
      .query({ userId: ownerId, limit: 5, offset: 0 })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items.every((order: any) => order.user_id === ownerId)).toBe(true);
  });

  it('возвращает 403 при попытке доступа к чужому заказу', async () => {
    const otherToken = signTestToken({ sub: 'another-user', email: 'another@example.com', role: 'user' });
    const response = await request(app)
      .get(`/v1/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});

