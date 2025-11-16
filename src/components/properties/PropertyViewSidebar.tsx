/**
 * PropertyViewSidebar Component
 * Displays detailed property information in view mode
 */

import type { Property } from '@/utils/permissions';
import { Badge } from '@/components/ui';
import { getStatusLabel, canEditProperty, canDeleteProperty } from '@/utils/permissions';
import { getStateLabel } from '@/utils/constants';
import { formatPrice, getStatusVariant } from '@/utils/formatters';

interface PropertyViewSidebarProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export const PropertyViewSidebar = ({
  property,
  onEdit,
  onDelete
}: PropertyViewSidebarProps) => {
  const canEdit = canEditProperty(property);
  const canDelete = canDeleteProperty(property);

  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Title, Status and Price Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex-1 leading-tight">
                {property.title}
              </h3>
              <Badge variant={getStatusVariant(property.status)} size="md" dot>
                {getStatusLabel(property.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-600">Precio:</span>
              <span className="font-bold text-primary">{formatPrice(property.price)}</span>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación
            </h4>
            <div className="space-y-3">
              {property.state && (
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px] font-medium">Estado:</span>
                  <span className="text-sm text-gray-900 font-medium flex-1">{getStateLabel(property.state)}</span>
                </div>
              )}
              {property.municipality && (
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px] font-medium">Municipio:</span>
                  <span className="text-sm text-gray-900 font-medium flex-1">{property.municipality}</span>
                </div>
              )}
              {property.neighborhood && (
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px] font-medium">Colonia:</span>
                  <span className="text-sm text-gray-900 font-medium flex-1">{property.neighborhood}</span>
                </div>
              )}
              {property.postal_code && (
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px] font-medium">Código Postal:</span>
                  <span className="text-sm text-gray-900 font-semibold flex-1">{property.postal_code}</span>
                </div>
              )}
              {property.street && (
                <div className="flex items-start gap-3 pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px] font-medium">Dirección:</span>
                  <span className="text-sm text-gray-900 font-medium flex-1">{property.street}</span>
                </div>
              )}

              {/* Google Maps Link - Integrated inside Location Card */}
              {property.google_maps_url && (
                <div className="pt-2">
                  <a
                    href={property.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group"
                    aria-label={`Ver ubicación de ${property.title} en Google Maps`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                        <svg className="w-5 h-5 text-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Ver en Google Maps</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Patent Card */}
          {property.patent && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-medium">Patente:</span>
                <span className="font-semibold text-gray-900">{property.patent}</span>
              </div>
            </div>
          )}

          {/* Technical Sheet Download */}
          {property.attachment_url && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Ficha Técnica
              </h4>
              <a
                href={property.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 hover:border-primary hover:bg-primary-light transition-all duration-200 group"
                aria-label={`Descargar ficha técnica de ${property.title}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                    <svg className="w-5 h-5 text-primary group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Descargar archivo</span>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Description Card */}
          {property.description && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Descripción
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          )}

          {/* Audit Trail Card */}
          {property.audit && (
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Información de Seguimiento
              </h4>
              <div className="space-y-3">
                {/* Created By */}
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Creación</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-gray-600">Por:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {property.audit.created_by.name || 'Usuario desconocido'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(property.audit.created_date).toLocaleString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modified By */}
                {property.audit.modified_by?.id && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Última Modificación</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600">Por:</span>
                        <span className="text-sm text-gray-900 font-medium">
                          {property.audit.modified_by.name || 'Usuario desconocido'}
                        </span>
                      </div>
                      {property.audit.modified_date && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-gray-600">Fecha:</span>
                          <span className="text-sm text-gray-700">
                            {new Date(property.audit.modified_date).toLocaleString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        {canEdit && onEdit && (
          <button
            onClick={() => onEdit(property)}
            className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
            aria-label={`Editar propiedad ${property.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        )}
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(property)}
            className="px-4 py-2.5 border-2 border-danger text-danger rounded-lg hover:bg-danger hover:text-white transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm"
            aria-label={`Eliminar propiedad ${property.title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        )}
      </div>
    </>
  );
};
