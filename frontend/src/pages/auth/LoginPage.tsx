import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../api/client';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);
  const error = useAuthStore((state) => state.error);
  const token = useAuthStore((state) => state.token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    try {
      await login(email.trim(), password);
      toast.success('Добро пожаловать!');
      const state = location.state as { from?: { pathname?: string } } | undefined;
      const redirectTo = state?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Не удалось войти'));
    }
  };

  return (
    <div className="auth-container">
      <Card
        className="auth-card"
        title="Вход"
        description="Используйте корпоративный аккаунт, чтобы продолжить работу"
      >
        <form className="form" onSubmit={handleSubmit}>
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
          <FormField label="Пароль" htmlFor="password" required>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </FormField>
          {error ? <div className="form-general-error">{error}</div> : null}
          <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
            Войти
          </Button>
        </form>
        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
        </p>
      </Card>
    </div>
  );
};

