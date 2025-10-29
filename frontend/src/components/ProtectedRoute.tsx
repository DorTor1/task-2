import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader } from './Loader';

export const ProtectedRoute = () => {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const initializing = useAuthStore((state) => state.initializing);
  const initialized = useAuthStore((state) => state.initialized);

  if (initializing || !initialized) {
    return (
      <div className="fullscreen-center">
        <Loader text="Загружаем данные..." />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

