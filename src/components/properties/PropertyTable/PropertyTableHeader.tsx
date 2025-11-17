/**
 * PropertyTableHeader Component
 * Table header with select-all checkbox
 */

interface PropertyTableHeaderProps {
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
}

export const PropertyTableHeader = ({
  isAllSelected,
  isSomeSelected,
  onSelectAll
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

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Propiedad
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Ubicación
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Estado
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
          Precio
        </th>

        {/* Actions column (sticky) - no sorting */}
        <th className="sticky top-0 right-0 z-30 bg-gray-50 w-32 px-2 py-2 sm:px-6 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider shadow-sticky-column">
          Acciones
        </th>
      </tr>
    </thead>
  );
};
