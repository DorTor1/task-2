import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersApi } from '../api/orders';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { StatusBadge } from '../components/StatusBadge';
import { useAuthStore } from '../store/authStore';
import type { Order, OrderStatus } from '../types/order';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { extractErrorMessage } from '../api/client';

const ORDER_STATUSES: OrderStatus[] = ['created', 'processing', 'completed', 'cancelled'];

const statusOptions = [{ value: 'all', label: 'Все статусы' }, ...ORDER_STATUSES.map((status) => ({
  value: status,
  label:
    status === 'created'
      ? 'Создан'
      : status === 'processing'
      ? 'В обработке'
      : status === 'completed'
      ? 'Завершён'
      : 'Отменён',
}))];

const sortOptions = [
  { value: 'desc', label: 'Новые сверху' },
  { value: 'asc', label: 'Старые сверху' },
];

const PAGE_LIMIT = 10;

export const OrdersPage = () => {
  const user = useAuthStore((state) => state.user);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialUserId = (searchParams.get('userId') ?? '').trim();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mutatingOrderId, setMutatingOrderId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<(OrderStatus | 'all')>('all');
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [filterUserId, setFilterUserId] = useState(initialUserId);
  const [filterUserIdInput, setFilterUserIdInput] = useState(initialUserId);

  const [newOrderUserId, setNewOrderUserId] = useState(initialUserId || user?.id || '');
  const [newOrderAmount, setNewOrderAmount] = useState('');
  const [newOrderMetadata, setNewOrderMetadata] = useState('');

  const isAdmin = user?.role === 'admin';
  const userIdFromQuery = initialUserId;

  useEffect(() => {
    if (!isAdmin) {
      if (filterUserId !== '') {
        setFilterUserId('');
      }
      if (filterUserIdInput !== '') {
        setFilterUserIdInput('');
      }
      const currentUserId = user?.id ?? '';
      if (newOrderUserId !== currentUserId) {
        setNewOrderUserId(currentUserId);
      }
      if (userIdFromQuery) {
        setSearchParams({}, { replace: true });
      }
    }
  }, [
    isAdmin,
    user?.id,
    userIdFromQuery,
    filterUserId,
    filterUserIdInput,
    newOrderUserId,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    if (filterUserId !== userIdFromQuery) {
      setFilterUserId(userIdFromQuery);
    }
    if (filterUserIdInput !== userIdFromQuery) {
      setFilterUserIdInput(userIdFromQuery);
    }
    if (userIdFromQuery && newOrderUserId !== userIdFromQuery) {
      setNewOrderUserId(userIdFromQuery);
    }
  }, [isAdmin, userIdFromQuery, filterUserId, filterUserIdInput, newOrderUserId]);

  const loadOrders = useCallback(
    async (signal?: AbortSignal) => {
      setIsFetching(true);
      try {
        const normalizedFilterUserId = filterUserId.trim();
        const result = await ordersApi.listOrders(
          {
            limit: PAGE_LIMIT,
            offset: page * PAGE_LIMIT,
            sort,
            status,
            userId: isAdmin ? (normalizedFilterUserId ? normalizedFilterUserId : undefined) : undefined,
          },
          signal
        );

        if (signal?.aborted) {
          return;
        }

        setOrders(result.items);
        setTotal(result.total);
      } catch (error) {
        if ((error as { code?: string }).code === 'ERR_CANCELED') {
          return;
        }
        toast.error(extractErrorMessage(error, 'Не удалось загрузить заказы'));
      } finally {
        if (!signal?.aborted) {
          setIsFetching(false);
        }
      }
    },
    [page, sort, status, filterUserId, isAdmin]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadOrders(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadOrders]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_LIMIT)), [total]);

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    const trimmed = filterUserIdInput.trim();
    setFilterUserId(trimmed);
    if (trimmed) {
      if (userIdFromQuery !== trimmed) {
        setSearchParams({ userId: trimmed }, { replace: true });
      }
      if (isAdmin) {
        setNewOrderUserId(trimmed);
      }
    } else if (userIdFromQuery) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleResetFilters = () => {
    setStatus('all');
    setSort('desc');
    setFilterUserId('');
    setFilterUserIdInput('');
    setPage(0);
    if (userIdFromQuery) {
      setSearchParams({}, { replace: true });
    }
  };

  const handleCreateOrder = async (event: FormEvent) => {
    event.preventDefault();

    const amount = Number.parseFloat(newOrderAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Введите корректную сумму заказа');
      return;
    }

    let metadata: Record<string, unknown> | undefined;
    if (newOrderMetadata.trim()) {
      try {
        metadata = JSON.parse(newOrderMetadata);
      } catch (error) {
        toast.error('Метаданные должны быть в формате JSON');
        return;
      }
    }

    try {
      setIsCreating(true);
      const userId = isAdmin ? newOrderUserId.trim() : user?.id;
      if (!userId) {
        toast.error('Укажите идентификатор пользователя');
        return;
      }
      await ordersApi.createOrder({ userId, totalAmount: amount, metadata });
      toast.success('Заказ создан');
      setNewOrderAmount('');
      setNewOrderMetadata('');
      if (isAdmin) {
        setNewOrderUserId(userId);
      }
      await loadOrders();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Не удалось создать заказ'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (orderId: string, value: OrderStatus) => {
    try {
      setMutatingOrderId(orderId);
      await ordersApi.updateStatus(orderId, value);
      toast.success('Статус обновлён');
      await loadOrders();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Не удалось обновить статус'));
    } finally {
      setMutatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setMutatingOrderId(orderId);
      await ordersApi.cancel(orderId);
      toast.success('Заказ отменён');
      await loadOrders();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Не удалось отменить заказ'));
    } finally {
      setMutatingOrderId(null);
    }
  };

  return (
    <div className="page-column">
      <Card title="Фильтры" description="Настройте подборку заказов">
        <form className="filters" onSubmit={handleFilterSubmit}>
          <div className="filters-row">
            <label className="filters-item">
              <span className="filters-label">Статус</span>
              <select className="input" value={status} onChange={(event) => setStatus(event.target.value as any)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="filters-item">
              <span className="filters-label">Сортировка</span>
              <select className="input" value={sort} onChange={(event) => setSort(event.target.value as 'asc' | 'desc')}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {isAdmin ? (
              <label className="filters-item">
                <span className="filters-label">ID пользователя</span>
                <input
                  className="input"
                  value={filterUserIdInput}
                  onChange={(event) => setFilterUserIdInput(event.target.value)}
                  placeholder="UUID пользователя"
                />
              </label>
            ) : null}
          </div>
          <div className="filters-actions">
            <Button type="submit" variant="primary" isLoading={isFetching}>
              Применить
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetFilters}>
              Сбросить
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Создание заказа" description="Укажите сумму и при необходимости метаданные">
        <form className="form" onSubmit={handleCreateOrder}>
          {isAdmin ? (
            <FormField label="ID пользователя" htmlFor="order-user" required>
              <input
                id="order-user"
                className="input"
                value={newOrderUserId}
                onChange={(event) => setNewOrderUserId(event.target.value)}
                placeholder="UUID пользователя"
                required
              />
            </FormField>
          ) : null}
          <FormField label="Сумма" htmlFor="order-amount" required>
            <input
              id="order-amount"
              className="input"
              value={newOrderAmount}
              onChange={(event) => setNewOrderAmount(event.target.value)}
              placeholder="Например, 1200"
              required
              inputMode="decimal"
            />
          </FormField>
          <FormField label="Метаданные" htmlFor="order-metadata" hint="JSON-формат, необязательное поле">
            <textarea
              id="order-metadata"
              className="textarea"
              value={newOrderMetadata}
              onChange={(event) => setNewOrderMetadata(event.target.value)}
              rows={4}
              placeholder='{"comment": "дополнительно"}'
            />
          </FormField>
          <Button type="submit" variant="primary" isLoading={isCreating}>
            Создать
          </Button>
        </form>
      </Card>

      <Card
        title="Список заказов"
        description={isFetching ? 'Обновляем данные...' : `Найдено ${total} заказов`}
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
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="empty-state">Заказы не найдены</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  {isAdmin ? <th>Пользователь</th> : null}
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Создан</th>
                  <th>Обновлён</th>
                  <th>Метаданные</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="ellipsis" title={order.id}>
                      {order.id}
                    </td>
                    {isAdmin ? (
                      <td className="ellipsis" title={order.userId}>
                        {order.userId}
                      </td>
                    ) : null}
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>{formatDateTime(order.updatedAt)}</td>
                    <td className="metadata-cell">
                      {order.metadata ? <code>{JSON.stringify(order.metadata)}</code> : '—'}
                    </td>
                    <td>
                      <div className="table-actions">
                        <select
                          className="input input-sm"
                          value={order.status}
                          disabled={mutatingOrderId === order.id || isFetching}
                          onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                        >
                          {ORDER_STATUSES.map((option) => (
                            <option key={option} value={option}>
                              {statusOptions.find((item) => item.value === option)?.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={order.status === 'cancelled' || mutatingOrderId === order.id || isFetching}
                        >
                          Отменить
                        </Button>
                      </div>
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

