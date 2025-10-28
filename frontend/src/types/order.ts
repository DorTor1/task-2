export type OrderStatus = 'created' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  total: number;
  items: T[];
}

