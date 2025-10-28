import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestIdHeader = req.header('x-request-id');
  const requestId = requestIdHeader && requestIdHeader.trim().length > 0 ? requestIdHeader : uuid();

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};

