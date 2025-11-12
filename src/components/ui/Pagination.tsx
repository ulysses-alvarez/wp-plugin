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

  const perPageOptions = [10, 20, 50, 100];
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-2 sm:gap-4">
      {/* Info de resultados */}
      {total > 0 && (
        <p className="text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
          <span className="font-semibold">{startItem}</span> a{' '}
          <span className="font-semibold">{endItem}</span> de{' '}
          <span className="font-semibold">{total}</span> propiedades
        </p>
      )}

      {/* Selector + Controles de paginación */}
      <div className={clsx('flex items-center gap-1 sm:gap-2', className)}>
        {/* Per Page Selector - compacto */}
        {showPerPageSelector && onPerPageChange && (
          <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-3">
            <label htmlFor="perPage" className="hidden sm:block text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Por página:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              title="Propiedades por página"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botón Primera */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={clsx(
              'px-1 py-0.5 sm:px-2 sm:py-1 rounded-md border transition-colors',
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            )}
            aria-label="Primera página"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'px-1 py-0.5 sm:px-2 sm:py-1 rounded-md border transition-colors',
            currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          )}
          aria-label="Página anterior"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Números de página */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">
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
                'px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md border transition-colors min-w-[24px] sm:min-w-[32px] text-xs sm:text-sm',
                isActive
                  ? 'bg-primary text-white border-primary font-semibold'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              )}
              aria-label={`Página ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'px-1 py-0.5 sm:px-2 sm:py-1 rounded-md border transition-colors',
            currentPage === totalPages
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          )}
          aria-label="Página siguiente"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Botón Última */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={clsx(
              'px-1 py-0.5 sm:px-2 sm:py-1 rounded-md border transition-colors',
              currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            )}
            aria-label="Última página"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
