import fs from 'fs';
import path from 'path';
import { db } from '../src/db';

jest.setTimeout(10000);

beforeEach(() => {
  db.exec('DELETE FROM orders');
});

afterAll(() => {
  db.close();
  const dbFile = process.env.DATABASE_URL?.replace('file:', '') || './tests/tmp/orders-test.db';
  const dbPath = path.resolve(__dirname, '..', dbFile);
  if (fs.existsSync(dbPath)) {
    try {
      fs.rmSync(dbPath, { force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && (error as NodeJS.ErrnoException).code !== 'EBUSY') {
        throw error;
      }
    }
  }
});

