import type { Order } from '../types/order';
import type { User } from '../types/user';

export const mapUser = (raw: any): User => ({
  id: raw.id,
  email: raw.email,
  name: raw.name,
  role: raw.role,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

export const mapOrder = (raw: any): Order => ({
  id: raw.id,
  userId: raw.user_id,
  status: raw.status,
  totalAmount: raw.total_amount,
  metadata: raw.metadata ?? undefined,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
});

