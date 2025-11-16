/**
 * PropertyTableRow Component (Memoized)
 * Individual row in the property table
 * Memoized to prevent unnecessary re-renders
 */

import { memo, useMemo } from 'react';
import type { Property } from '@/utils/permissions';
import { canEditProperty, canDeleteProperty, getStatusLabel } from '@/utils/permissions';
import { getStateLabel } from '@/utils/constants';
import { formatPrice, getStatusVariant } from '@/utils/formatters';
import { Badge } from '@/components/ui';
import { PropertyActionMenu } from './PropertyActionMenu';
import clsx from 'clsx';

interface PropertyTableRowProps {
  property: Property;
  isSelected: boolean;
  isHovered: boolean;
  onPropertySelect: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertyDelete?: (property: Property) => void;
  onToggleSelection: (propertyId: number) => void;
  onMouseEnter: (propertyId: number) => void;
  onMouseLeave: () => void;
}

export const PropertyTableRow = memo(({
  property,
  isSelected,
  isHovered,
  onPropertySelect,
  onPropertyEdit,
  onPropertyDelete,
  onToggleSelection,
  onMouseEnter,
  onMouseLeave
}: PropertyTableRowProps) => {
  // Memoize permission calculations (expensive operations)
  const canEdit = useMemo(() => canEditProperty(property), [property]);
  const canDelete = useMemo(() => canDeleteProperty(property), [property]);

  return (
    <tr
      role="button"
      tabIndex={0}
      className={clsx(
        'transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
        isHovered ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
      onMouseEnter={() => onMouseEnter(property.id)}
      onMouseLeave={onMouseLeave}
      onClick={() => onPropertySelect(property)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPropertySelect(property);
        }
      }}
      aria-label={`Propiedad ${property.title}`}
    >
      {/* Checkbox */}
      <td
        className="w-12 px-3 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(property.id)}
          className="checkbox-primary"
          title={
            isSelected
              ? 'Deseleccionar propiedad'
              : 'Seleccionar propiedad'
          }
        />
      </td>

      {/* Property Name & Patent */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {property.title}
          </div>
          {property.patent && (
            <div className="text-sm text-gray-500 mt-0.5">
              Patente: {property.patent}
            </div>
          )}
        </div>
      </td>

      {/* Location */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="text-sm text-gray-900 flex items-start gap-1.5">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex flex-col max-w-xs">
            {property.state && (
              <span className="font-medium truncate">{getStateLabel(property.state)}</span>
            )}
            <span className="text-gray-600 text-sm truncate">
              {property.municipality}
              {property.neighborhood && `, ${property.neighborhood}`}
              {property.postal_code && `. C.P. ${property.postal_code}`}
            </span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-3 py-3 sm:px-6 sm:py-4">
        <Badge
          variant={getStatusVariant(property.status)}
          className="px-1.5 py-0.5 text-xs sm:px-2.5 sm:py-1 sm:text-sm"
        >
          {getStatusLabel(property.status)}
        </Badge>
      </td>

      {/* Price */}
      <td className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-4">
        <div className="text-sm font-semibold text-gray-900">
          {formatPrice(property.price)}
        </div>
      </td>

      {/* Actions - Sticky Column */}
      <td
        className={clsx(
          'sticky right-0 z-10 px-2 py-2 sm:px-6 sm:py-4 text-right shadow-sticky-column',
          isHovered ? 'bg-gray-100' : 'bg-white'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile/Tablet: Action Menu (< 1024px) */}
        <div className="lg:hidden flex items-center justify-end">
          <PropertyActionMenu
            property={property}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={onPropertySelect}
            onEdit={onPropertyEdit}
            onDelete={onPropertyDelete}
          />
        </div>

        {/* Desktop: Individual Action Buttons (>= 1024px) */}
        <div className="hidden lg:flex items-center justify-end gap-1">
          {/* Ver */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPropertySelect(property);
            }}
            className="p-1 sm:p-1.5 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
            title="Ver detalles"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Editar */}
          {canEdit && onPropertyEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropertyEdit(property);
              }}
              className="p-1 sm:p-1.5 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
              title="Editar propiedad"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* Eliminar */}
          {canDelete && onPropertyDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropertyDelete(property);
              }}
              className="p-1 sm:p-1.5 text-gray-600 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar propiedad"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these props change
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.property.title === nextProps.property.title &&
    prevProps.property.status === nextProps.property.status &&
    prevProps.property.price === nextProps.property.price &&
    prevProps.property.state === nextProps.property.state &&
    prevProps.property.municipality === nextProps.property.municipality &&
    prevProps.property.patent === nextProps.property.patent &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isHovered === nextProps.isHovered
  );
});

PropertyTableRow.displayName = 'PropertyTableRow';
