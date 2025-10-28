import request from 'supertest';
import app from '../../src/app';
import { signTestToken } from '../helpers/auth';

jest.mock('../../src/services/userClient', () => ({
  userClient: {
    ensureUserExists: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('POST /v1/orders', () => {
  const userId = '11111111-1111-1111-1111-111111111111';
  const token = signTestToken({ sub: userId, email: 'buyer@example.com', role: 'user' });

  it('создает заказ для авторизованного пользователя', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId,
        totalAmount: 1499,
        metadata: { comment: 'Test order' },
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        user_id: userId,
        status: 'created',
        total_amount: 1499,
      })
    );
  });

  it('запрещает создавать заказ без токена', async () => {
    const response = await request(app).post('/v1/orders').send({
      userId,
      totalAmount: 1499,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('запрещает создавать заказ для другого пользователя без роли admin', async () => {
    const response = await request(app)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: '22222222-2222-2222-2222-222222222222',
        totalAmount: 999,
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});

