import { config } from './config';
import { userRepository } from './repositories/userRepository';
import { passwordService } from './services/passwordService';
import { logger } from './logger';
import { v4 as uuid } from 'uuid';

export const ensureAdminUser = async () => {
  const existing = userRepository.findByEmail(config.admin.email);
  if (existing) {
    return;
  }

  const now = new Date().toISOString();
  const password_hash = await passwordService.hash(config.admin.password);

  userRepository.create({
    id: uuid(),
    email: config.admin.email,
    password_hash,
    name: 'Administrator',
    role: 'admin',
    created_at: now,
    updated_at: now,
  });

  logger.info('Default admin user created');
};

