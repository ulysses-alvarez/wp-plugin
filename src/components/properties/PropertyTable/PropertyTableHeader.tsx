/**
 * PropertyTableHeader Component
 * Table header with sortable columns and select-all checkbox
 */

import { SortableTableHeader } from '@/components/ui';
import type { SortKey } from '@/components/ui';

interface PropertyTableHeaderProps {
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (sortKey: SortKey) => void;
}

export const PropertyTableHeader = ({
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort
}: PropertyTableHeaderProps) => {
  return (
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        {/* Checkbox column */}
        <th className="sticky top-0 z-30 bg-gray-50 w-12 px-3 py-2 sm:py-3">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = isSomeSelected;
              }
            }}
            onChange={onSelectAll}
            className="checkbox-primary"
            title={isAllSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
          />
        </th>

        <SortableTableHeader
          label="Propiedad"
          sortKey="title"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />

        <SortableTableHeader
          label="Ubicación"
          sortKey="state"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />

        <SortableTableHeader
          label="Estado"
          sortKey="status"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
        />

        <SortableTableHeader
          label="Precio"
          sortKey="price"
          currentSortBy={sortBy}
          currentSortOrder={sortOrder}
          onSort={onSort}
          className="hidden md:table-cell"
        />

        {/* Actions column (sticky) - no sorting */}
        <th className="sticky top-0 right-0 z-30 bg-gray-50 w-32 px-2 py-2 sm:px-6 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider shadow-sticky-column">
          Acciones
        </th>
      </tr>
    </thead>
  );
};
