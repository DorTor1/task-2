import 'dotenv/config';

const requiredEnv = [
  'PORT',
  'DATABASE_URL',
  'JWT_PRIVATE_KEY',
  'JWT_PUBLIC_KEY',
  'JWT_EXPIRES_IN',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'INTERNAL_API_KEY',
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is required`);
  }
});

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4001,
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    publicKey: process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, '\n'),
    expiresIn: process.env.JWT_EXPIRES_IN!,
  },
  admin: {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  },
  internalApiKey: process.env.INTERNAL_API_KEY!,
};

