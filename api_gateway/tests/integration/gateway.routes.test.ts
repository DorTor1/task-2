import request from 'supertest';
import express from 'express';
import { buildApp } from '../../src/app';
import { signGatewayToken } from '../helpers/auth';

const captured: { users: string[]; orders: string[] } = { users: [], orders: [] };

jest.mock('../../src/routes/proxy', () => {
  const routerFactory = (type: 'users' | 'orders') => {
    const router = express.Router();
    router.get('/check', (req, res) => {
      captured[type].push(String(req.headers['x-request-id'] || ''));
      res.json({ success: true, data: { service: type } });
    });
    return router;
  };

  return {
    usersProxy: routerFactory('users'),
    ordersProxy: routerFactory('orders'),
  };
});

describe('API Gateway маршруты и middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    captured.users = [];
    captured.orders = [];
    app = buildApp();
  });

  it('проксирует запросы к /v1/users', async () => {
    const response = await request(app).get('/v1/users/check');

    expect(response.status).toBe(200);
    expect(response.body.data.service).toBe('users');
    expect(captured.users.length).toBe(1);
  });

  it('передает X-Request-ID до сервисов и обратно', async () => {
    const response = await request(app)
      .get('/v1/users/check')
      .set('X-Request-ID', 'custom-id-123');

    expect(response.headers['x-request-id']).toBe('custom-id-123');
    expect(captured.users[0]).toBe('custom-id-123');
  });

  it('требует JWT для маршрутов /v1/orders', async () => {
    const token = signGatewayToken({ sub: 'order-user', role: 'user' });

    const unauthorized = await request(app).get('/v1/orders/check');
    expect(unauthorized.status).toBe(401);

    const authorized = await request(app)
      .get('/v1/orders/check')
      .set('Authorization', `Bearer ${token}`);

    expect(authorized.status).toBe(200);
    expect(captured.orders.length).toBe(1);
  });

  it('возвращает 429 при превышении rate limit', async () => {
    for (let i = 0; i < 3; i += 1) {
      const res = await request(app).get('/v1/users/check');
      expect(res.status).toBe(200);
    }

    const limited = await request(app).get('/v1/users/check');
    expect(limited.status).toBe(429);
  });

  it('устанавливает CORS заголовки', async () => {
    const response = await request(app).get('/v1/users/check');
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});

