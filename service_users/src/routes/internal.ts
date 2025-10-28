import { Router } from 'express';
import { userService } from '../services/userService';
import { fail, ok } from '../utils/response';
import { z } from 'zod';
import { config } from '../config';

const router = Router();

const internalAuthSchema = z.string().min(1);

router.use((req, res, next) => {
  try {
    const header = internalAuthSchema.parse(req.header('x-internal-api-key'));
    if (header !== config.internalApiKey) {
      return fail(res, { code: 'FORBIDDEN', message: 'Invalid internal API key' }, 403);
    }
    return next();
  } catch (error) {
    return fail(res, { code: 'FORBIDDEN', message: 'Invalid internal API key' }, 403);
  }
});

router.get('/users/:id', (req, res) => {
  const user = userService.getProfile(req.params.id);
  if (!user) {
    return fail(res, { code: 'NOT_FOUND', message: 'User not found' }, 404);
  }
  return ok(res, user);
});

export const internalRouter = router;

