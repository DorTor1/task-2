import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';

process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '0';

const tmpDir = path.resolve(__dirname, './tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const workerId = process.env.JEST_WORKER_ID ?? '1';
const dbFile = `orders-test-${workerId}.db`;
process.env.DATABASE_URL = `file:./tests/tmp/${dbFile}`;
process.env.TEST_DB_FILE = dbFile;
process.env.INTERNAL_API_KEY = 'test-internal-key';
process.env.USERS_SERVICE_URL = 'http://users.service.test';

if (!process.env.JWT_PUBLIC_KEY || !process.env.TEST_JWT_PRIVATE_KEY) {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  process.env.TEST_JWT_PRIVATE_KEY = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  process.env.JWT_PUBLIC_KEY = publicKey.export({ type: 'spki', format: 'pem' }).toString();
}

