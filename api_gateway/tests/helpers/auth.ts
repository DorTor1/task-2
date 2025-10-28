import jwt from 'jsonwebtoken';

export const signGatewayToken = (payload: { sub: string; email?: string; role?: string } = { sub: 'user-id' }) => {
  const privateKey = process.env.TEST_JWT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('TEST_JWT_PRIVATE_KEY not configured');
  }

  return jwt.sign(
    {
      email: 'user@example.com',
      role: 'user',
      ...payload,
    },
    privateKey,
    {
      algorithm: 'RS256',
      expiresIn: '1h',
    }
  );
};

