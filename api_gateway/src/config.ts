import 'dotenv/config';

const requiredEnv = ['PORT', 'USERS_SERVICE_URL', 'ORDERS_SERVICE_URL', 'JWT_PUBLIC_KEY'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is required`);
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8080,
  usersServiceUrl: process.env.USERS_SERVICE_URL!,
  ordersServiceUrl: process.env.ORDERS_SERVICE_URL!,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n'),
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
  },
};

