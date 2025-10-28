import { z } from 'zod';

export const createOrderSchema = z.object({
  userId: z.string().uuid(),
  totalAmount: z.number().positive(),
  metadata: z.record(z.any()).optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['created', 'processing', 'completed', 'cancelled']).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['processing', 'completed', 'cancelled']),
});

