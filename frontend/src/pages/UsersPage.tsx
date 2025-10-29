import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { usersApi } from '../api/users';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/user';
import { formatDateTime } from '../utils/formatters';
import { extractErrorMessage } from '../api/client';

const PAGE_LIMIT = 10;

export const UsersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [role, setRole] = useState<'all' | 'user' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const result = await usersApi.listUsers({
          limit: PAGE_LIMIT,
          offset: page * PAGE_LIMIT,
          role,
          search: search.trim() || undefined,
        });
        setItems(result.items);
        setTotal(result.total);
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Не удалось загрузить пользователей'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, role, search, isAdmin]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_LIMIT)), [total]);

  if (!isAdmin) {
    return (
      <Card title="Недостаточно прав" description="Доступ к разделу разрешён только администраторам" />
    );
  }

  const handleFilter = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleReset = () => {
    setRole('all');
    setSearch('');
    setSearchInput('');
    setPage(0);
  };

  return (
    <div className="page-column">
      <Card title="Фильтры" description="Выберите роль или выполните поиск">
        <form className="filters" onSubmit={handleFilter}>
          <div className="filters-row">
            <FormField label="Роль" htmlFor="users-role">
              <select
                id="users-role"
                className="input"
                value={role}
                onChange={(event) => setRole(event.target.value as typeof role)}
              >
                <option value="all">Все</option>
                <option value="user">Пользователи</option>
                <option value="admin">Администраторы</option>
              </select>
            </FormField>
            <FormField label="Поиск" htmlFor="users-search" hint="Имя или email">
              <input
                id="users-search"
                className="input"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Поиск"
              />
            </FormField>
          </div>
          <div className="filters-actions">
            <Button type="submit" variant="primary" isLoading={loading}>
              Применить
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              Сбросить
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Пользователи"
        description={loading ? 'Загрузка...' : `Всего ${total}`}
        actions={
          <div className="pagination">
            <span>
              Страница {page + 1} из {totalPages}
            </span>
            <div className="pagination-buttons">
              <Button type="button" variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                Назад
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page + 1 >= totalPages}
              >
                Вперёд
              </Button>
            </div>
          </div>
        }
      >
        <div className="users-list">
          {items.length === 0 ? (
            <p className="empty-state">Пользователи не найдены</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Создан</th>
                  <th>Обновлён</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>{formatDateTime(item.updatedAt)}</td>
                    <td>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/dashboard/orders?userId=${item.id}`)}
                      >
                        Заказы
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

