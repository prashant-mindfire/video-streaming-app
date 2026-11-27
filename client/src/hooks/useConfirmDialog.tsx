import { useState } from 'react';
import { ConfirmDialog } from '../components/common';

interface UseConfirmDialogOptions<T> {
  title: string;
  message: (item: T) => string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: (item: T) => void | Promise<void>;
}

const useConfirmDialog = <T,>({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
}: UseConfirmDialogOptions<T>) => {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const open = (item: T) => setSelectedItem(item);

  const close = () => {
    if (!isLoading) {
      setSelectedItem(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  const handleConfirm = async () => {
    if (!selectedItem || isLoading) return;

    try {
      setIsLoading(true);
      await onConfirm(selectedItem);
      setSelectedItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      open={selectedItem !== null}
      title={title}
      confirmText={confirmText}
      cancelText={cancelText}
      variant={variant}
      isLoading={isLoading}
      onConfirm={handleConfirm}
      onOpenChange={handleOpenChange}
      description={selectedItem !== null ? message(selectedItem) : ''}
    />
  );

  return {
    open,
    close,
    dialog,
    selectedItem,
    isLoading,
  };
};

export default useConfirmDialog;
