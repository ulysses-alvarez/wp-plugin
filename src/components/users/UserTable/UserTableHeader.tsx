/**
 * UserTableHeader Component
 * Table header for users table (simplified - no checkboxes)
 */

export const UserTableHeader = () => {
  return (
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nombre
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Email
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Rol
        </th>

        <th className="sticky top-0 z-30 bg-gray-50 px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
          Fecha de Registro
        </th>

        {/* Actions column (sticky) */}
        <th className="sticky top-0 right-0 z-40 bg-gray-50 w-32 pl-2 pr-3 py-2 sm:pl-6 sm:pr-7 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider shadow-sticky-column">
          <span className="hidden sm:inline">Acciones</span>
        </th>
      </tr>
    </thead>
  );
};
