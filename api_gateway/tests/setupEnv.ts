import { generateKeyPairSync } from 'crypto';

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '0';
process.env.USERS_SERVICE_URL = 'http://users.service.test';
process.env.ORDERS_SERVICE_URL = 'http://orders.service.test';
process.env.RATE_LIMIT_WINDOW_MS = '1000';
process.env.RATE_LIMIT_MAX = '3';

if (!process.env.JWT_PUBLIC_KEY || !process.env.TEST_JWT_PRIVATE_KEY) {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  process.env.TEST_JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

