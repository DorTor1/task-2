import 'dotenv/config';

const requiredEnv = ['PORT', 'DATABASE_URL', 'USERS_SERVICE_URL', 'JWT_PUBLIC_KEY', 'INTERNAL_API_KEY'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is required`);
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4002,
  databaseUrl: process.env.DATABASE_URL!,
  usersServiceUrl: process.env.USERS_SERVICE_URL!,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n'),
  internalApiKey: process.env.INTERNAL_API_KEY!,
};

