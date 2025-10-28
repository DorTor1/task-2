import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { extractErrorMessage } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, clearError, error, token } = useAuthStore((state) => ({
    register: state.register,
    isLoading: state.isLoading,
    clearError: state.clearError,
    error: state.error,
    token: state.token,
  }));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true });
    }
    return () => {
      clearError();
    };
  }, [token, navigate, clearError]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      return;
    }
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      toast.success('Аккаунт создан');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Не удалось зарегистрироваться'));
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card" title="Регистрация" description="Создайте новый аккаунт пользователя">
        <form className="form" onSubmit={handleSubmit}>
          <FormField label="Имя" htmlFor="name" required>
            <input
              id="name"
              name="name"
              type="text"
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Иван Иванов"
              required
              minLength={2}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" required>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </FormField>
          <FormField label="Пароль" htmlFor="password" required hint="Минимум 6 символов">
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </FormField>
          <FormField label="Подтверждение пароля" htmlFor="confirmPassword" required>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Повторите пароль"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </FormField>
          {error ? <div className="form-general-error">{error}</div> : null}
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Создать аккаунт
          </Button>
        </form>
        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войдите</Link>
        </p>
      </Card>
    </div>
  );
};

