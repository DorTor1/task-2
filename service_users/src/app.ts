import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { config } from './config';
import { logger } from './logger';
import { ok, fail } from './utils/response';
import { authService } from './services/authService';
import { userService } from './services/userService';
import { passwordService } from './services/passwordService';
import { registerSchema, loginSchema, updateProfileSchema, listUsersSchema } from './validation/schemas';
import { AuthRequest, authMiddleware, adminOnly } from './middleware/auth';
import { internalRouter } from './routes/internal';

export const buildApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get('/v1/health', (_req, res) => ok(res, { status: 'ok' }));

  app.post('/v1/users/register', async (req, res) => {
    try {
      const body = registerSchema.parse(req.body);
      const user = await authService.register(body);
      return ok(res, user, 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_EXISTS') {
        return fail(res, { code: 'USER_EXISTS', message: 'User already exists' }, 409);
      }
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid input' }, 400);
    }
  });

  app.post('/v1/users/login', async (req, res) => {
    try {
      const body = loginSchema.parse(req.body);
      const { token, user } = await authService.login(body);
      return ok(res, { token, user });
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return fail(res, { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }, 401);
      }
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid input' }, 400);
    }
  });

  app.get('/v1/users/me', authMiddleware, (req: AuthRequest, res) => {
    const profile = userService.getProfile(req.user!.sub);
    if (!profile) {
      return fail(res, { code: 'NOT_FOUND', message: 'User not found' }, 404);
    }
    return ok(res, profile);
  });

  app.patch('/v1/users/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const body = updateProfileSchema.parse(req.body);
      const updated = userService.updateProfile(req.user!.sub, {
        name: body.name,
        password_hash: body.password ? await passwordService.hash(body.password) : undefined,
      });

      if (!updated) {
        return fail(res, { code: 'NOT_FOUND', message: 'User not found' }, 404);
      }

      return ok(res, updated);
    } catch (error) {
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid input' }, 400);
    }
  });

  app.get('/v1/users', authMiddleware, adminOnly, (req, res) => {
    try {
      const query = listUsersSchema.parse(req.query);
      const result = userService.listUsers(query);
      return ok(res, result);
    } catch (error) {
      if (error instanceof Error) {
        return fail(res, { code: 'BAD_REQUEST', message: error.message }, 400);
      }
      return fail(res, { code: 'BAD_REQUEST', message: 'Invalid query parameters' }, 400);
    }
  });

  app.use('/v1/internal', internalRouter);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof Error) {
      logger.error({ err }, 'Unhandled error');
    }
    return fail(res, { code: 'INTERNAL_ERROR', message: 'Internal server error' }, 500);
  });

  return app;
};

const app = buildApp();

export default app;

