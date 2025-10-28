import { createProxyMiddleware } from 'http-proxy-middleware';
import type { Request } from 'express';
import type { ClientRequest } from 'http';
import { config } from '../config';

const forwardRequestId = {
  on: {
    proxyReq(proxyReq: ClientRequest, req: Request) {
      const requestId = req.headers['x-request-id'];
      if (requestId) {
        proxyReq.setHeader('X-Request-ID', requestId);
      }
    },
  },
} as const;

export const usersProxy = createProxyMiddleware({
  target: config.usersServiceUrl,
  changeOrigin: true,
  ...forwardRequestId,
});

export const ordersProxy = createProxyMiddleware({
  target: config.ordersServiceUrl,
  changeOrigin: true,
  ...forwardRequestId,
});

