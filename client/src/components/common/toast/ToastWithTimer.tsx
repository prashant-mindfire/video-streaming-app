import { useEffect } from 'react';
import { Toast, type ToastItem } from './Toast';

interface ToastWithTimerProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

export const ToastWithTimer = ({ toast, onClose }: ToastWithTimerProps) => {
  useEffect(() => {
    const duration = toast.duration ?? 4000;

    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return <Toast toast={toast} onClose={onClose} />;
};
