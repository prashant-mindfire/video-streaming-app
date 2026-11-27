import { Dialog } from './Dialog';
import { Button } from '@/components/common/Button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  variant = 'primary',
}: ConfirmDialogProps) => {
  const confirmClass =
    variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="
              rounded-md border border-gray-300
              px-4 py-2 text-sm font-medium text-gray-700
              hover:bg-gray-50
              disabled:cursor-not-allowed disabled:opacity-50
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-blue-600
            "
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`
              rounded-md px-4 py-2 text-sm font-medium text-white
              disabled:cursor-not-allowed disabled:opacity-50
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-offset-2
              focus-visible:ring-blue-600
              ${confirmClass}
            `}
          >
            {isLoading ? 'Please wait...' : confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-gray-700">{description}</p>
    </Dialog>
  );
};
