/**
 * PropertyGrid Component
 * Displays properties in a grid layout with pagination
 */

import { useEffect, useState, useRef } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { PropertyCard } from './PropertyCard';
import { LoadingSpinner, Pagination } from '@/components/ui';
import type { Property } from '@/utils/permissions';
import { canCreateProperty } from '@/utils/permissions';

interface PropertyGridProps {
  onPropertySelect: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertyDelete?: (property: Property) => void;
  onCreateNew?: () => void;
}

export const PropertyGrid = ({
  onPropertySelect,
  onPropertyEdit,
  onPropertyDelete,
  onCreateNew
}: PropertyGridProps) => {
  const {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    perPage,
    filters,
    loadProperties,
    setPage,
    setPerPage
  } = usePropertyStore();

  const [initialLoad, setInitialLoad] = useState(true);
  
  // Ref to grid container for scrolling
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const canCreate = canCreateProperty();

  // Load properties on mount and when pagination or filters change
  useEffect(() => {
    loadProperties().finally(() => setInitialLoad(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, filters.searchField, filters.searchValue]);

  const handlePageChange = (page: number) => {
    setPage(page);

    // Scroll to top after page change
    requestAnimationFrame(() => {
      if (gridContainerRef.current) {
        const scrollableParent = gridContainerRef.current.closest('.overflow-auto');
        
        if (scrollableParent) {
          scrollableParent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
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
        <h3 className="text-lg font-semibold text-danger mb-2">Error al cargar propiedades</h3>
        <p className="text-danger-dark">{error}</p>
        <button
          onClick={() => loadProperties()}
          className="mt-4 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    // Determinar si hay búsqueda activa
    const hasActiveSearch = filters.searchValue && filters.searchValue.trim() !== '';

    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        
        {hasActiveSearch ? (
          // Búsqueda sin resultados
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-500 mb-6">
              No hay propiedades que coincidan con tu búsqueda. Intenta con otros criterios.
            </p>
          </>
        ) : (
          // Sistema completamente vacío
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay propiedades disponibles
            </h3>
            <p className="text-gray-500 mb-6">
              {canCreate
                ? 'Comienza agregando tu primera propiedad'
                : 'No tienes propiedades asignadas en este momento'
              }
            </p>
            {canCreate && onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                + Agregar Primera Propiedad
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={gridContainerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Propiedades</h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} {total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
        </div>
        {canCreate && onCreateNew && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Propiedad
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onView={onPropertySelect}
            onEdit={onPropertyEdit}
            onDelete={onPropertyDelete}
          />
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && !initialLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="pt-6">
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
  );
};
