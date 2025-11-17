/**
 * UserTableRow Component (Memoized)
 * Individual row in the users table
 * Memoized to prevent unnecessary re-renders
 */

import { memo } from 'react';
import type { User } from '@/types/user.types';
import { getRoleVariant } from '@/utils/formatters';
import { Badge } from '@/components/ui';

interface UserTableRowProps {
  user: User;
  onEditUser: (userId: number) => void;
}

export const UserTableRow = memo(({
  user,
  onEditUser
}: UserTableRowProps) => {
  // Construir nombre completo solo si existe y es diferente al display name
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const showFullName = fullName && fullName !== user.name;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Nombre */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {user.name}
          </div>
          {showFullName && (
            <div className="text-sm text-gray-500 mt-0.5">
              {fullName}
            </div>
          )}
        </div>
      </td>

      {/* Email */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>

      {/* Rol */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <Badge
          variant={getRoleVariant(user.role)}
          className="px-1.5 py-0.5 text-xs sm:px-2.5 sm:py-1 sm:text-sm"
        >
          {user.role_label}
        </Badge>
      </td>

      {/* Fecha de Registro */}
      <td className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-4">
        <div className="text-sm text-gray-500">
          {new Date(user.registered).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </td>

      {/* Acciones - Sticky Column */}
      <td className="sticky right-0 z-10 pl-2 pr-3 py-2 sm:pl-6 sm:pr-7 sm:py-4 text-right shadow-sticky-column bg-white">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditUser(user.id);
          }}
          className="p-1 sm:p-1.5 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
          title="Editar usuario"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these props change
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name &&
    prevProps.user.email === nextProps.user.email &&
    prevProps.user.role === nextProps.user.role &&
    prevProps.user.role_label === nextProps.user.role_label &&
    prevProps.user.first_name === nextProps.user.first_name &&
    prevProps.user.last_name === nextProps.user.last_name &&
    prevProps.user.registered === nextProps.user.registered
  );
});

UserTableRow.displayName = 'UserTableRow';
