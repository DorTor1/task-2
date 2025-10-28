import { OrderEvent } from '../types';
import { logger } from '../logger';

export const eventBus = {
  publish(event: OrderEvent) {
    logger.info({ event }, 'Order event published');
    // Заглушка: здесь можно подключить брокер сообщений (Kafka, RabbitMQ и т.д.)
  },
};

