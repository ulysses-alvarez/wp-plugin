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
        <div className="flex flex-col items-center">
          {!isActive ? (
            // Both arrows inactive (gray)
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          ) : (
            // Active sorting arrow (green)
            <>
              {isAscending ? (
                // Arrow up (ASC)
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                // Arrow down (DESC)
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </>
          )}
        </div>
      </div>
    </th>
  );
};
