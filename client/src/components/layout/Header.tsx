import { useState } from 'react';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '../common/toast/useToast';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      toast.success('Logged out successfully.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="font-semibold text-gray-800">Video Management</h1>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="text-gray-500 hover:text-gray-700"
        >
          <Bell size={20} />
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="User profile"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <UserCircle size={25} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-20 w-56 rounded-lg border bg-white py-2 shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={17} />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
