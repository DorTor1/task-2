import fs from 'fs';
import path from 'path';
import { db } from '../src/db';
import { ensureAdminUser } from '../src/bootstrap';

jest.setTimeout(10000);

beforeEach(async () => {
  db.exec('DELETE FROM users');
  await ensureAdminUser();
});

afterAll(() => {
  db.close();
  const dbFile = process.env.DATABASE_URL?.replace('file:', '') || './tests/tmp/users-test.db';
  const dbPath = path.resolve(__dirname, '..', dbFile);
  if (fs.existsSync(dbPath)) {
    try {
      fs.rmSync(dbPath, { force: true });
    } catch (error) {
      // Игнорируем проблемы блокировки файла на Windows
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && (error as NodeJS.ErrnoException).code !== 'EBUSY') {
        throw error;
      }
    }
  }
});

