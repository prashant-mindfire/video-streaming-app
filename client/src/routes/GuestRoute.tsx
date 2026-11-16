import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/videos" replace /> : <Outlet />;
};
