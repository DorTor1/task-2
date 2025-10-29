import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FormField } from '../components/FormField';
import { useAuthStore } from '../store/authStore';
import { formatDateTime } from '../utils/formatters';

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }

    try {
      await updateProfile({ name: name.trim(), password: password || undefined });
      toast.success('Профиль обновлён');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error((error as Error).message || 'Не удалось обновить профиль');
    }
  };

  return (
    <div className="page-grid">
      <Card title="Личные данные" description="Основная информация о вашем профиле">
        <dl className="profile-list">
          <div className="profile-item">
            <dt>Имя</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="profile-item">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="profile-item">
            <dt>Роль</dt>
            <dd>{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</dd>
          </div>
          <div className="profile-item">
            <dt>Создан</dt>
            <dd>{formatDateTime(user.createdAt)}</dd>
          </div>
          <div className="profile-item">
            <dt>Обновлён</dt>
            <dd>{formatDateTime(user.updatedAt)}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Редактирование" description="Вы можете изменить отображаемое имя и пароль">
        <form className="form" onSubmit={handleSubmit}>
          <FormField label="Имя" htmlFor="profile-name" required>
            <input
              id="profile-name"
              type="text"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </FormField>
          <FormField label="Новый пароль" htmlFor="profile-password" hint="Оставьте пустым, если не хотите менять">
            <input
              id="profile-password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              placeholder="********"
            />
          </FormField>
          <FormField label="Подтверждение пароля" htmlFor="profile-password-confirm">
            <input
              id="profile-password-confirm"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
              placeholder="********"
            />
          </FormField>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Сохранить изменения
          </Button>
        </form>
      </Card>
    </div>
  );
};

