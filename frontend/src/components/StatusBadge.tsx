import classNames from 'classnames';
import type { OrderStatus } from '../types/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Создан',
  processing: 'В обработке',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => {
  return <span className={classNames('status-badge', `status-${status}`)}>{STATUS_LABELS[status]}</span>;
};

