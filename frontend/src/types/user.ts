export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResult {
  total: number;
  items: User[];
}

