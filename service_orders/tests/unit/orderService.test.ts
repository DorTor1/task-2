import { orderService } from '../../src/services/orderService';
import { orderRepository } from '../../src/repositories/orderRepository';
import { eventBus } from '../../src/services/eventBus';

jest.mock('../../src/repositories/orderRepository', () => ({
  orderRepository: {
    create: jest.fn(),
    findById: jest.fn(),
    listByUser: jest.fn(),
    updateStatus: jest.fn(),
    cancel: jest.fn(),
  },
}));

jest.mock('../../src/services/eventBus', () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

describe('orderService', () => {
  const mockedRepository = orderRepository as jest.Mocked<typeof orderRepository>;
  const mockedEventBus = eventBus as jest.Mocked<typeof eventBus>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('создает заказ и публикует событие', () => {
    const created = orderService.createOrder({ userId: 'u1', totalAmount: 1000 });

    expect(mockedRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'u1',
      total_amount: 1000,
      status: 'created',
    }));
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'created',
        payload: expect.objectContaining({ orderId: created.id }),
      })
    );
  });

  it('обновляет статус и публикует событие', () => {
    mockedRepository.updateStatus.mockReturnValueOnce({
      id: 'order1',
      user_id: 'u1',
      status: 'completed',
      total_amount: 1000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);

    const updated = orderService.updateStatus('order1', 'completed');

    expect(mockedRepository.updateStatus).toHaveBeenCalledWith('order1', 'completed');
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'status_updated', payload: { orderId: 'order1', userId: 'u1', status: 'completed' } })
    );
    expect(updated?.status).toBe('completed');
  });

  it('не публикует событие, если заказ не найден при обновлении статуса', () => {
    mockedRepository.updateStatus.mockReturnValueOnce(undefined);

    const updated = orderService.updateStatus('missing', 'cancelled');

    expect(updated).toBeUndefined();
    expect(mockedEventBus.publish).not.toHaveBeenCalled();
  });
});

