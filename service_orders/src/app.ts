import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './logger';
import { ok, fail } from './utils/response';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { createOrderSchema, paginationSchema, updateStatusSchema } from './validation/schemas';
import { userClient } from './services/userClient';
import { orderService } from './services/orderService';

export const buildApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get('/v1/health', (_req, res) => ok(res, { status: 'ok' }));

  app.post('/v1/orders', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const body = createOrderSchema.parse(req.body);

      if (req.user!.sub !== body.userId && req.user!.role !== 'admin') {
        return fail(res, { code: 'FORBIDDEN', message: 'Cannot create order for another user' }, 403);
      }

      await userClient.ensureUserExists(body.userId, req.header('authorization')!);

      const order = orderService.createOrder({
        userId: body.userId,
        totalAmount: body.totalAmount,
        metadata: body.metadata,
      });

      return ok(res, order, 201);
    } catch (error) {
      if (error instanceof Error) {
        if ((error as any).response?.status === 404) {
          return fail(res, { code: 'USER_NOT_FOUND', message: 'User does not exist' }, 404);
        }
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid input' }, 400);
    }
  });

  app.get('/v1/orders/:id', authMiddleware, (req: AuthRequest, res) => {
    const order = orderService.getOrder(req.params.id);
    if (!order) {
      return fail(res, { code: 'NOT_FOUND', message: 'Order not found' }, 404);
    }
    if (order.user_id !== req.user!.sub && req.user!.role !== 'admin') {
      return fail(res, { code: 'FORBIDDEN', message: 'Access denied' }, 403);
    }
    return ok(res, order);
  });

  app.get('/v1/orders', authMiddleware, (req: AuthRequest, res) => {
    try {
      const query = paginationSchema.parse(req.query);
      const userId =
        req.user!.role === 'admin' && typeof req.query.userId === 'string' ? req.query.userId : req.user!.sub;
      const result = orderService.listOrders({
        userId,
        limit: query.limit,
        offset: query.offset,
        sort: query.sort,
        status: query.status,
      });
      return ok(res, result);
    } catch (error) {
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid query parameters' }, 400);
    }
  });

  app.patch('/v1/orders/:id/status', authMiddleware, (req: AuthRequest, res) => {
    try {
      const body = updateStatusSchema.parse(req.body);
      const order = orderService.getOrder(req.params.id);
      if (!order) {
        return fail(res, { code: 'NOT_FOUND', message: 'Order not found' }, 404);
      }
      if (order.user_id !== req.user!.sub && req.user!.role !== 'admin') {
        return fail(res, { code: 'FORBIDDEN', message: 'Access denied' }, 403);
      }

      const updated = orderService.updateStatus(order.id, body.status);
      return ok(res, updated!);
    } catch (error) {
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid input' }, 400);
    }
  });

  app.delete('/v1/orders/:id', authMiddleware, (req: AuthRequest, res) => {
    const order = orderService.getOrder(req.params.id);
    if (!order) {
      return fail(res, { code: 'NOT_FOUND', message: 'Order not found' }, 404);
    }
    if (order.user_id !== req.user!.sub && req.user!.role !== 'admin') {
      return fail(res, { code: 'FORBIDDEN', message: 'Access denied' }, 403);
    }
    const cancelled = orderService.cancelOrder(order.id);
    return ok(res, cancelled!);
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error) {
      logger.error({ err }, 'Unhandled error in orders service');
    }
    return fail(res, { code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500);
  });

  return app;
};

const app = buildApp();

export default app;

