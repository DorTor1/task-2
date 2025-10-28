import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path }, 'Unhandled error in API Gateway');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
};

