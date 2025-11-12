/**
 * SortableTableHeader Component
 * Table header with sortable functionality
 */

import clsx from 'clsx';

export type SortKey = 'ID' | 'title' | 'state' | 'municipality' | 'status' | 'price' | 'date';

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

  // Get tooltip text based on state
  const getTooltip = () => {
    if (!isActive) {
      return `Haz clic para ordenar por ${label.toLowerCase()}`;
    }
    return isAscending
      ? `Ordenando ascendente (A → Z). Haz clic para invertir`
      : `Ordenando descendente (Z → A). Haz clic para invertir`;
  };

  // Get direction indicator text
  const getDirectionText = () => {
    if (!isActive) return null;

    // Customize based on the sort key
    switch (sortKey) {
      case 'price':
        return isAscending ? 'Menor' : 'Mayor';
      case 'date':
      case 'ID':
        return isAscending ? 'Antiguo' : 'Reciente';
      default:
        return isAscending ? 'A-Z' : 'Z-A';
    }
  };

  const directionText = getDirectionText();

  return (
    <th
      className={clsx(
        'px-6 py-3 text-xs uppercase tracking-wider',
        'cursor-pointer select-none hover:bg-gray-100 transition-colors',
        getTextAlign(),
        isActive ? 'font-semibold text-gray-700' : 'font-medium text-gray-500',
        className
      )}
      onClick={handleClick}
      title={getTooltip()}
    >
      <div className="flex items-center gap-2 justify-start">
        <span>{label}</span>

        {/* Sort Indicator */}
        {!isActive ? (
          // Inactive - Double arrow (up and down)
          <svg className="w-4 h-4 text-gray-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        ) : (
          // Active sorting - Single arrow with direction indicator
          <div className="flex items-center gap-1">
            {isAscending ? (
              // Arrow up (ASC)
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              // Arrow down (DESC)
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {directionText && (
              <span className="text-[10px] text-primary font-normal">
                {directionText}
              </span>
            )}
          </div>
        )}
      </div>
    </th>
  );
};
