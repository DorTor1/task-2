export interface Order {
  id: string;
  user_id: string;
  status: 'created' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  type: 'created' | 'status_updated';
  payload: {
    orderId: string;
    userId: string;
    status: Order['status'];
  };
}

export interface PaginatedOrders {
  total: number;
  items: Order[];
}

