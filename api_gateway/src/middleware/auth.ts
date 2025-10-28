import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../logger';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role?: string;
    [key: string]: unknown;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Authorization header is missing',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Bearer token missing',
      },
    });
  }

  try {
    const payload = jwt.verify(token, config.jwtPublicKey, {
      algorithms: ['RS256'],
    });
    req.user = payload as AuthRequest['user'];
    next();
  } catch (error) {
    logger.warn({ err: error }, 'Failed to verify token');
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Invalid token',
      },
    });
  }
};

