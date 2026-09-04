import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between py-2 text-xs text-[var(--text-muted)] ${className}`}>
      {totalRecords !== undefined && pageSize !== undefined ? (
        <div>
          Showing{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {(currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {Math.min(currentPage * pageSize, totalRecords)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-[var(--text-primary)]">{totalRecords}</span> records
        </div>
      ) : (
        <div>
          Page <span className="font-semibold text-[var(--text-primary)]">{currentPage}</span> of{' '}
          <span className="font-semibold text-[var(--text-primary)]">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconOnly
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        <span className="px-2 font-mono text-xs font-medium text-[var(--text-primary)]">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          iconOnly
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconOnly
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
