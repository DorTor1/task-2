import { db } from '../db';
import { PublicUser, User } from '../types';

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

export const userRepository = {
  findByEmail(email: string): User | undefined {
    const stmt = db.prepare<[string], User>('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById(id: string): User | undefined {
    const stmt = db.prepare<[string], User>('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  create(user: User): PublicUser {
    const stmt = db.prepare(
      'INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(user.id, user.email, user.password_hash, user.name, user.role, user.created_at, user.updated_at);
    return toPublicUser(user);
  },

  update(id: string, data: Partial<Omit<User, 'id'>>): PublicUser | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updated: User = {
      ...existing,
      email: data.email ?? existing.email,
      password_hash: data.password_hash ?? existing.password_hash,
      name: data.name ?? existing.name,
      role: data.role ?? existing.role,
      created_at: existing.created_at,
      updated_at: data.updated_at || new Date().toISOString(),
    };

    const stmt = db.prepare(
      'UPDATE users SET email = ?, password_hash = ?, name = ?, role = ?, updated_at = ? WHERE id = ?'
    );

    stmt.run(updated.email, updated.password_hash, updated.name, updated.role, updated.updated_at, id);

    return toPublicUser(updated);
  },

  list(params: { limit: number; offset: number; role?: string; search?: string }): {
    total: number;
    items: PublicUser[];
  } {
    const filters: string[] = [];
    const values: (string | number)[] = [];

    if (params.role) {
      filters.push('role = ?');
      values.push(params.role);
    }

    if (params.search) {
      filters.push('(email LIKE ? OR name LIKE ?)');
      values.push(`%${params.search}%`, `%${params.search}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const totalStmt = db.prepare<(string | number)[], { count: number }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`
    );
    const totalResult = totalStmt.get(...values);
    const total = totalResult?.count ?? 0;

    const stmt = db.prepare<(string | number)[], User>(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    );
    const queryParams: (string | number)[] = [...values, params.limit, params.offset];
    const items = stmt.all(...queryParams).map(toPublicUser);

    return { total, items };
  },

  ensureAdmin(user: User) {
    if (user.role !== 'admin') {
      throw new Error('NOT_ADMIN');
    }
  },
};

