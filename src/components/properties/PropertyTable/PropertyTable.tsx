/**
 * PropertyTable Component
 * Displays properties in a table layout (Dashlane-style)
 * Optimized with React.memo and useMemo for better performance
 */

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { LoadingSpinner, Pagination } from '@/components/ui';
import type { Property } from '@/utils/permissions';
import { canCreateProperty } from '@/utils/permissions';
import { usePropertySelection } from '@/hooks/usePropertySelection';
import { PropertyTableRow } from '../PropertyTableRow';
import { PropertyTableHeader } from './PropertyTableHeader';

interface PropertyTableProps {
  onPropertySelect: (property: Property) => void;
  onPropertyEdit?: (property: Property) => void;
  onPropertyDelete?: (property: Property) => void;
  onCreateNew?: () => void;
  onSelectionChange?: (selectedIds: Set<number>, selectedProperties: Property[]) => void;
}

export const PropertyTable = ({
  onPropertySelect,
  onPropertyEdit,
  onPropertyDelete,
  onCreateNew,
  onSelectionChange
}: PropertyTableProps) => {
  // Performance optimization: Combine Zustand selectors to reduce re-renders
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
    filters,
    loadProperties,
    setPage,
    setPerPage
  } = usePropertyStore();

  const [initialLoad, setInitialLoad] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Ref to table container for scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const canCreate = canCreateProperty();

  // Bulk selection hook
  const {
    selectedIds,
    toggleProperty,
    selectAll,
    isPropertySelected,
    getSelectedProperties,
    clearSelections,
  } = usePropertySelection();

  // Clean up invalid selections when properties change (after bulk operations)
  useEffect(() => {
    if (selectedIds.size > 0 && properties.length > 0) {
      const currentPropertyIds = new Set(properties.map((p) => p.id));
      const hasInvalidSelections = Array.from(selectedIds).some(
        (id) => !currentPropertyIds.has(id)
      );

      if (hasInvalidSelections) {
        clearSelections();
      }
    }
  }, [properties, selectedIds, clearSelections]);

  // Performance optimization: Use storage event instead of polling
  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'propertySelection' && !e.newValue && selectedIds.size > 0) {
        clearSelections();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedIds.size, clearSelections]);

  // Listen for custom event to clear selections (from same tab)
  // This is triggered when modals are closed or bulk actions are cancelled
  useEffect(() => {
    const handleClearSelections = () => {
      clearSelections();
    };

    window.addEventListener('clearPropertySelections', handleClearSelections);
    return () => window.removeEventListener('clearPropertySelections', handleClearSelections);
  }, [clearSelections]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedProperties = getSelectedProperties(properties);
      onSelectionChange(selectedIds, selectedProperties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, properties]);

  // Performance optimization: Memoize expensive calculations
  const { currentPagePropertyIds, isAllCurrentPageSelected, isSomeCurrentPageSelected } = useMemo(() => {
    const ids = properties.map((p) => p.id);
    const isAll = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    const isSome = ids.some((id) => selectedIds.has(id)) && !isAll;

    return {
      currentPagePropertyIds: ids,
      isAllCurrentPageSelected: isAll,
      isSomeCurrentPageSelected: isSome
    };
  }, [properties, selectedIds]);

  // Performance optimization: Memoize callbacks to prevent unnecessary re-renders
  const handleSelectAllCurrentPage = useCallback(() => {
    if (isAllCurrentPageSelected) {
      // Deselect all on current page
      currentPagePropertyIds.forEach((id) => {
        if (selectedIds.has(id)) {
          toggleProperty(id);
        }
      });
    } else {
      // Select all on current page
      selectAll(currentPagePropertyIds);
    }
  }, [isAllCurrentPageSelected, currentPagePropertyIds, selectedIds, toggleProperty, selectAll]);

  const handleMouseEnter = useCallback((propertyId: number) => {
    setHoveredRow(propertyId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredRow(null);
  }, []);

  // Load properties on mount and when pagination, sorting, or filters change
  useEffect(() => {
    loadProperties().finally(() => setInitialLoad(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage, sortBy, sortOrder, filters.searchField, filters.searchValue]);

  const handlePageChange = (page: number) => {
    setPage(page);

    // Scroll to top after page change
    // Use requestAnimationFrame to ensure the page change is processed first
    requestAnimationFrame(() => {
      // Find the scrollable parent container (the one in PropertiesPage)
      if (tableContainerRef.current) {
        // Find the closest parent element with overflow-auto class
        const scrollableParent = tableContainerRef.current.closest('.overflow-auto');
        
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
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              No hay propiedades que coincidan con tu búsqueda. Intenta con otros criterios.
            </p>
          </>
        ) : (
          // Sistema completamente vacío
          <>
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
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={tableContainerRef} className="h-full flex flex-col">
      {/* Table Container - Scrollable con altura calculada */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-0">
        <table className="w-full">
          <PropertyTableHeader
            isAllSelected={isAllCurrentPageSelected}
            isSomeSelected={isSomeCurrentPageSelected}
            onSelectAll={handleSelectAllCurrentPage}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <PropertyTableRow
                key={property.id}
                property={property}
                isSelected={isPropertySelected(property.id)}
                isHovered={hoveredRow === property.id}
                onPropertySelect={onPropertySelect}
                onPropertyEdit={onPropertyEdit}
                onPropertyDelete={onPropertyDelete}
                onToggleSelection={toggleProperty}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination - Fixed at bottom en mobile, normal en desktop */}
      {total > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-2.5 sm:px-6 sm:py-4 bg-gray-50">
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
