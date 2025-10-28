import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { config } from '../config';
import { userRepository } from '../repositories/userRepository';
import { PublicUser, TokenPayload, User } from '../types';
import { passwordService } from './passwordService';

export const authService = {
  async register(input: { email: string; password: string; name: string }): Promise<PublicUser> {
    const existing = userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('USER_EXISTS');
    }

    const now = new Date().toISOString();
    const password_hash = await passwordService.hash(input.password);

    const user: User = {
      id: uuid(),
      email: input.email,
      password_hash,
      name: input.name,
      role: 'user',
      created_at: now,
      updated_at: now,
    };

    return userRepository.create(user);
  },

  async login(input: { email: string; password: string }): Promise<{ token: string; user: PublicUser }> {
    const user = userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await passwordService.compare(input.password, user.password_hash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };

    const token = jwt.sign(payload, config.jwt.privateKey as jwt.Secret, {
      algorithm: 'RS256',
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  },

  verify(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.publicKey, { algorithms: ['RS256'] }) as TokenPayload;
  },
};

