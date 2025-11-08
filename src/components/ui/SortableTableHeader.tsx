/**
 * SortableTableHeader Component
 * Table header with sortable functionality
 */

import clsx from 'clsx';

export type SortKey = 'title' | 'state' | 'municipality' | 'status' | 'price' | 'date';

interface SortableTableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (sortKey: SortKey) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const SortableTableHeader = ({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  align = 'left',
  className
}: SortableTableHeaderProps) => {
  const isActive = currentSortBy === sortKey;
  const isAscending = currentSortOrder === 'asc';

  const handleClick = () => {
    onSort(sortKey);
  };

  const getTextAlign = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <th
      className={clsx(
        'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        'cursor-pointer select-none hover:bg-gray-100 transition-colors',
        getTextAlign(),
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 justify-start">
        <span>{label}</span>

        {/* Sort Indicator */}
        {!isActive ? (
          // No sorting - gray chevron
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          // Active sorting - green chevron
          <>
            {isAscending ? (
              // Chevron up (ASC)
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              // Chevron down (DESC)
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </>
        )}
      </div>
    </th>
  );
};
