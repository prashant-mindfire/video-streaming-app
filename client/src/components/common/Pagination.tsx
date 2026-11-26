import type { FC } from 'react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export const Pagination: FC<PaginationProps> = ({
  page,
  totalPages,
  totalItems,
  onPageChange,
  ariaLabel = 'Pagination',
}: PaginationProps) => {
  if (totalPages <= 0) return null;

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" aria-atomic="true" className="text-sm text-gray-500">
        Page {page} of {totalPages} · {totalItems} results
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          aria-label={`Go to previous page, page ${Math.max(1, page - 1)}`}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          aria-label={`Go to next page, page ${Math.min(totalPages, page + 1)}`}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};
