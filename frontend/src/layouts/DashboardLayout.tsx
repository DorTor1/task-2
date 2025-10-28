import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-logo" aria-hidden="true">
            ●
          </span>
          <span>Система контроля</span>
        </div>
        <div className="app-header__actions">
          <div className="app-user">
            <span className="app-user__name">{user?.name}</span>
            <span className="app-user__role">{user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <nav className="app-nav">
            <NavLink to="profile" className={({ isActive }) => (isActive ? 'app-nav__link is-active' : 'app-nav__link')}>
              Профиль
            </NavLink>
            <NavLink to="orders" className={({ isActive }) => (isActive ? 'app-nav__link is-active' : 'app-nav__link')}>
              Заказы
            </NavLink>
            {user?.role === 'admin' ? (
              <NavLink
                to="users"
                className={({ isActive }) => (isActive ? 'app-nav__link is-active' : 'app-nav__link')}
              >
                Пользователи
              </NavLink>
            ) : null}
          </nav>
        </aside>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

