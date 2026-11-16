import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    styles: 'bg-green-50 border-green-200 text-green-700',
  },
  error: {
    icon: AlertCircle,
    styles: 'bg-red-50 border-red-200 text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  },
  info: {
    icon: Info,
    styles: 'bg-blue-50 border-blue-200 text-blue-700',
  },
};

export const Toast = ({ toast, onClose }: ToastProps) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg ${config.styles}`}
    >
      <Icon size={20} className="shrink-0" />

      <p className="flex-1 text-sm font-medium">{toast.message}</p>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};
