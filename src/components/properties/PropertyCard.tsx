/**
 * PropertyCard Component
 * Displays a single property as a card
 */

import type { Property } from '@/utils/permissions';
import { Badge } from '@/components/ui';
import { getStatusLabel } from '@/utils/permissions';
import { canEditProperty, canDeleteProperty } from '@/utils/permissions';
import clsx from 'clsx';

interface PropertyCardProps {
  property: Property;
  onView: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  className?: string;
}

const formatPrice = (price?: number): string => {
  if (!price) return 'Sin precio';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'sold':
      return 'danger';
    case 'rented':
      return 'warning';
    case 'reserved':
      return 'info';
    default:
      return 'default';
  }
};

export const PropertyCard = ({
  property,
  onView,
  onEdit,
  onDelete,
  className
}: PropertyCardProps) => {
  const canEdit = canEditProperty(property);
  const canDelete = canDeleteProperty(property);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit && canEdit) {
      onEdit(property);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && canDelete) {
      onDelete(property);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx(
        'card p-4 cursor-pointer hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary',
        className
      )}
      onClick={() => onView(property)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onView(property);
        }
      }}
      aria-label={`Propiedad ${property.title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {property.title}
          </h3>
          {property.patent && (
            <p className="text-sm text-gray-500">
              Patente: <span className="font-medium">{property.patent}</span>
            </p>
          )}
        </div>
        <Badge variant={getStatusVariant(property.status)}>
          {getStatusLabel(property.status)}
        </Badge>
      </div>

      {/* Location */}
      {(property.municipality || property.state) && (
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">
              {property.neighborhood && `${property.neighborhood}, `}
              {property.municipality}
              {property.state && `, ${property.state}`}
            </span>
          </div>
        </div>
      )}

      {/* Description */}
      {property.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {property.description}
        </p>
      )}

      {/* Price */}
      <div className="mb-4 pt-3 border-t border-gray-100">
        <p className="text-lg font-bold text-primary">
          {formatPrice(property.price)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(property)}
          className="flex-1 px-3 py-2 text-sm font-medium text-primary bg-primary-light hover:bg-primary hover:text-white rounded-lg transition-colors"
        >
          Ver Detalles
        </button>

        {canEdit && onEdit && (
          <button
            onClick={handleEdit}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {canDelete && onDelete && (
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm font-medium text-danger bg-danger-light hover:bg-danger hover:text-white rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
