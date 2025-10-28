import jwt from 'jsonwebtoken';

interface TokenOptions {
  sub: string;
  email?: string;
  role?: 'user' | 'admin';
}

export const signTestToken = ({ sub, email = 'user@example.com', role = 'user' }: TokenOptions) => {
  const privateKey = process.env.TEST_JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('TEST_JWT_PRIVATE_KEY is not defined');
  }

  return jwt.sign({ sub, email, role }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  });
};

