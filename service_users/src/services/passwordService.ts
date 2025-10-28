import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const passwordService = {
  hash(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
};

