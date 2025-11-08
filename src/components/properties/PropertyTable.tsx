/**
 * PropertyTable Component
 * Displays properties in a table layout (Dashlane-style)
 */

import { useEffect, useState } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { LoadingSpinner, Pagination, Badge, SortableTableHeader } from '@/components/ui';
import type { SortKey } from '@/components/ui';
import type { Property } from '@/utils/permissions';
import { canCreateProperty, canEditProperty, canDeleteProperty, getStatusLabel } from '@/utils/permissions';
import clsx from 'clsx';

interface PropertyTableProps {
  onPropertySelect: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertyDelete?: (property: Property) => void;
  onCreateNew?: () => void;
}

const formatPrice = (price?: number): string => {
  if (!price) return 'Sin precio';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

export const PropertyTable = ({
  onPropertySelect,
  onPropertyEdit,
  onPropertyDelete,
  onCreateNew
}: PropertyTableProps) => {
  const {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    sortBy,
    sortOrder,
    loadProperties,
    setPage,
    setPerPage,
    setSortBy,
    setSortOrder
  } = usePropertyStore();

  const [initialLoad, setInitialLoad] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const canCreate = canCreateProperty();

  // Load properties on mount and when page or perPage changes
  useEffect(() => {
    loadProperties().finally(() => setInitialLoad(false));
  }, [currentPage, perPage, loadProperties]);

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const handleSort = (sortKey: SortKey) => {
    if (sortBy === sortKey) {
      // Toggle order if same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to descending
      setSortBy(sortKey);
      setSortOrder('desc');
    }
  };

  if (initialLoad && loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Cargando propiedades..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-light border border-danger rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-danger mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-base font-semibold text-danger mb-2">Error al cargar propiedades</h3>
        <p className="text-sm text-danger-dark">{error}</p>
        <button
          onClick={() => loadProperties()}
          className="mt-4 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No hay propiedades disponibles
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {canCreate
            ? 'Comienza agregando tu primera propiedad'
            : 'No tienes propiedades asignadas en este momento'
          }
        </p>
        {canCreate && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            + Agregar Primera Propiedad
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Propiedades</h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} {total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>
        {canCreate && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Propiedad
          </button>
        )}
      </div>

      {/* Table Container - Scrollable */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <SortableTableHeader
                  label="Propiedad"
                  sortKey="title"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Ubicación"
                  sortKey="state"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Estado"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Precio"
                  sortKey="price"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => {
                const canEdit = canEditProperty(property);
                const canDelete = canDeleteProperty(property);
                const isHovered = hoveredRow === property.id;

                return (
                  <tr
                    key={property.id}
                    className={clsx(
                      'transition-colors cursor-pointer',
                      isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                    onMouseEnter={() => setHoveredRow(property.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onPropertySelect(property)}
                  >
                    {/* Property Name & Patent */}
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-start gap-1.5">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex flex-col max-w-xs">
                          {property.neighborhood && (
                            <span className="truncate">{property.neighborhood}</span>
                          )}
                          <span className="text-gray-600 text-sm truncate">
                            {property.municipality}
                            {property.state && `, ${property.state}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPropertySelect(property);
                          }}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {canEdit && onPropertyEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPropertyEdit(property);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {canDelete && onPropertyDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPropertyDelete(property);
                            }}
                            className="p-2 text-gray-600 hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination - Fixed at bottom */}
        {total > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={total}
              perPage={perPage}
              onPageChange={handlePageChange}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && !initialLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}
    </div>
  );
};
