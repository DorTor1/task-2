import { config } from './config';
import { logger } from './logger';
import { ensureAdminUser } from './bootstrap';
import app from './app';

export const start = async () => {
  try {
    await ensureAdminUser();
    app.listen(config.port, () => {
      logger.info(`Users service listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start users service');
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  void start();
}

export default app;

