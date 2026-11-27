import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
  showCloseButton?: boolean;
  hideHeader?: boolean;
}

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName = '',
  showCloseButton = true,
  hideHeader,
}: DialogProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="
            fixed inset-0 z-50
            bg-black/60
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
          "
        />

        <DialogPrimitive.Content
          aria-describedby={description ? undefined : undefined}
          className={`
            fixed left-1/2 top-1/2 z-50
            w-[calc(100%-2rem)] max-w-lg
            -translate-x-1/2 -translate-y-1/2
            rounded-xl bg-white p-6 shadow-xl
            outline-none
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            ${hideHeader ? 'p-0' : 'p-6'}
            ${contentClassName}
          `}
        >
          {hideHeader ? (
            <>
              <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>

              {description && (
                <DialogPrimitive.Description className="sr-only">
                  {description}
                </DialogPrimitive.Description>
              )}
            </>
          ) : (
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <DialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogPrimitive.Title>

                {description && (
                  <DialogPrimitive.Description className="mt-1 text-sm text-gray-600">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>

              {showCloseButton && (
                <DialogPrimitive.Close asChild>
                  <Button
                    type="button"
                    aria-label="Close dialog"
                    className="
                    rounded-md p-1 text-gray-600
                    hover:bg-gray-100
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-blue-600
                  "
                  >
                    <X size={20} aria-hidden="true" />
                  </Button>
                </DialogPrimitive.Close>
              )}
            </div>
          )}
          <div>{children}</div>

          {footer && <div className="mt-6">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
