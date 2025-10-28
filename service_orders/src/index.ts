import { config } from './config';
import { logger } from './logger';
import app from './app';

export const start = () => {
  app.listen(config.port, () => {
    logger.info(`Orders service listening on port ${config.port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;

