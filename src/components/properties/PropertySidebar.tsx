/**
 * PropertySidebar Component
 * Displays detailed property information in a sidebar
 */

import { useEffect } from 'react';
import type { Property } from '@/utils/permissions';
import { Badge } from '@/components/ui';
import { getStatusLabel, canEditProperty, canDeleteProperty } from '@/utils/permissions';
import clsx from 'clsx';

interface PropertySidebarProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
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

export const PropertySidebar = ({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: PropertySidebarProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!property) return null;

  const canEdit = canEditProperty(property);
  const canDelete = canDeleteProperty(property);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-xl transform transition-transform duration-300 z-50 overflow-y-auto',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detalles de la Propiedad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Title and Status */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900 flex-1">
                {property.title}
              </h3>
              <Badge variant={getStatusVariant(property.status)} size="lg">
                {getStatusLabel(property.status)}
              </Badge>
            </div>
            {property.patent && (
              <p className="text-gray-600">
                Patente: <span className="font-semibold">{property.patent}</span>
              </p>
            )}
          </div>

          {/* Price */}
          <div className="bg-primary-light rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Precio</p>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(property.price)}
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación
            </h4>
            <div className="space-y-2">
              {property.street && (
                <div className="flex">
                  <span className="text-gray-600 w-24">Calle:</span>
                  <span className="text-gray-900 font-medium">{property.street}</span>
                </div>
              )}
              {property.neighborhood && (
                <div className="flex">
                  <span className="text-gray-600 w-24">Colonia:</span>
                  <span className="text-gray-900 font-medium">{property.neighborhood}</span>
                </div>
              )}
              {property.municipality && (
                <div className="flex">
                  <span className="text-gray-600 w-24">Municipio:</span>
                  <span className="text-gray-900 font-medium">{property.municipality}</span>
                </div>
              )}
              {property.state && (
                <div className="flex">
                  <span className="text-gray-600 w-24">Estado:</span>
                  <span className="text-gray-900 font-medium">{property.state}</span>
                </div>
              )}
              {property.postal_code && (
                <div className="flex">
                  <span className="text-gray-600 w-24">C.P.:</span>
                  <span className="text-gray-900 font-medium">{property.postal_code}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Google Maps */}
          {property.google_maps_url && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Mapa</h4>
              <a
                href={property.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver en Google Maps
              </a>
            </div>
          )}

          {/* Attachment */}
          {property.attachment_id && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Ficha Técnica</h4>
              <button className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar archivo
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(property)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(property)}
              className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </>
  );
};
