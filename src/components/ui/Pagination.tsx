/**
 * Pagination Component
 * Handles pagination with page numbers and navigation
 */

import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showPerPageSelector?: boolean;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  total = 0,
  perPage = 20,
  onPageChange,
  onPerPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  showPerPageSelector = true,
  className
}: PaginationProps) => {
  if (totalPages <= 1 && !showPerPageSelector) return null;

  const perPageOptions = [5, 10, 20, 50, 100];
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the start or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="space-y-3">
      {/* Pagination Controls */}
      <div className={clsx('flex items-center justify-center gap-1', className)}>
        {/* First Page Button */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={clsx(
              'px-2 py-1.5 rounded-md border transition-colors text-sm',
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            )}
            aria-label="Primera página"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={clsx(
          'px-2 py-1.5 rounded-md border transition-colors text-sm',
          currentPage === 1
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        )}
        aria-label="Página anterior"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-gray-500 text-sm">
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={clsx(
              'px-3 py-1.5 rounded-md border transition-colors min-w-[32px] text-sm',
              isActive
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            )}
            aria-label={`Página ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={clsx(
          'px-2 py-1.5 rounded-md border transition-colors text-sm',
          currentPage === totalPages
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        )}
        aria-label="Página siguiente"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Last Page Button */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={clsx(
            'px-2 py-1.5 rounded-md border transition-colors text-sm',
            currentPage === totalPages
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          )}
          aria-label="Última página"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}
      </div>

      {/* Info and Per Page Selector */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        {/* Results Info */}
        {total > 0 && (
          <p>
            Mostrando <span className="font-semibold">{startItem}</span> a{' '}
            <span className="font-semibold">{endItem}</span> de{' '}
            <span className="font-semibold">{total}</span> propiedades
          </p>
        )}

        {/* Per Page Selector */}
        {showPerPageSelector && onPerPageChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="perPage" className="text-sm text-gray-600">
              Items por página:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
