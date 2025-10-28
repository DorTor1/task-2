import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './logger';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { ordersProxy, usersProxy } from './routes/proxy';

export const buildApp = () => {
  const app = express();

  app.use(cors());
  app.use(requestIdMiddleware);
  app.use(pinoHttp({ logger }));
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.use('/v1/users', usersProxy);
  app.use('/v1/orders', authMiddleware, ordersProxy);

  app.use(errorHandler);

  return app;
};

const app = buildApp();

export default app;

