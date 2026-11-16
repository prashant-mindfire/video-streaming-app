import { createContext, useCallback, useState, type ReactNode } from 'react';
import { type ToastItem, type ToastType } from './Toast';
import { ToastWithTimer } from './ToastWithTimer';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, message, type, duration }]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success: (message) => showToast(message, 'success'),
        error: (message) => showToast(message, 'error'),
        warning: (message) => showToast(message, 'warning'),
        info: (message) => showToast(message, 'info'),
      }}
    >
      {children}

      <div className="fixed right-4 top-4 z-9999 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <ToastWithTimer key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
