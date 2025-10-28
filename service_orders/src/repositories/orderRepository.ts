import { db } from '../db';
import { Order, PaginatedOrders } from '../types';

const parseOrderRow = (row: any): Order => ({
  ...row,
  metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
});

export const orderRepository = {
  create(order: Order): Order {
    const stmt = db.prepare(
      'INSERT INTO orders (id, user_id, status, total_amount, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      order.id,
      order.user_id,
      order.status,
      order.total_amount,
      order.metadata ? JSON.stringify(order.metadata) : null,
      order.created_at,
      order.updated_at
    );
    return order;
  },

  findById(id: string): Order | undefined {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const row = stmt.get(id);
    return row ? parseOrderRow(row) : undefined;
  },

  updateStatus(id: string, status: Order['status']): Order | undefined {
    const order = this.findById(id);
    if (!order) return undefined;
    const updated_at = new Date().toISOString();
    const stmt = db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, updated_at, id);
    return { ...order, status, updated_at };
  },

  cancel(id: string): Order | undefined {
    return this.updateStatus(id, 'cancelled');
  },

  listByUser(params: {
    userId: string;
    limit: number;
    offset: number;
    sort: 'asc' | 'desc';
    status?: Order['status'];
  }): PaginatedOrders {
    const filters: string[] = ['user_id = ?'];
    const values: (string | number)[] = [params.userId];

    if (params.status) {
      filters.push('status = ?');
      values.push(params.status);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const totalStmt = db.prepare<(string | number)[], { count: number }>(
      `SELECT COUNT(*) as count FROM orders ${whereClause}`
    );
    const totalResult = totalStmt.get(...values);
    const total = totalResult?.count ?? 0;

    const stmt = db.prepare<(string | number)[], Order>(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at ${params.sort.toUpperCase()} LIMIT ? OFFSET ?`
    );
    const queryParams: (string | number)[] = [...values, params.limit, params.offset];
    const rows = stmt.all(...queryParams);
    return {
      total,
      items: rows.map(parseOrderRow),
    };
  },
};

