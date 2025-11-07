/**
 * PropertyFilters Component
 * Filter controls for properties
 */

import { useEffect } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { SearchBar, Select } from '@/components/ui';
import { PROPERTY_STATUS_OPTIONS, MEXICAN_STATES } from '@/utils/constants';

export const PropertyFilters = () => {
  const {
    filters,
    sortBy,
    sortOrder,
    setSearch,
    setStatusFilter,
    setStateFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    loadProperties
  } = usePropertyStore();

  const hasActiveFilters = filters.search || filters.status || filters.state;

  // Reload properties when filters or sort changes
  useEffect(() => {
    loadProperties();
  }, [filters, sortBy, sortOrder, loadProperties]);

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleToggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortOptions = [
    { value: 'date', label: 'Fecha de creación' },
    { value: 'title', label: 'Título' },
    { value: 'price', label: 'Precio' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Filtros y Ordenamiento</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-3">
          <SearchBar
            onSearch={setSearch}
            placeholder="Buscar por título, patente, municipio..."
            debounceMs={500}
          />
        </div>

        {/* Status Filter */}
        <Select
          label="Estado de la Propiedad"
          options={[...PROPERTY_STATUS_OPTIONS]}
          value={filters.status}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Todos los estados"
        />

        {/* State Filter */}
        <Select
          label="Estado de la República"
          options={[...MEXICAN_STATES]}
          value={filters.state}
          onChange={(e) => setStateFilter(e.target.value)}
          placeholder="Todos los estados"
        />

        {/* Results Summary */}
        <div className="flex items-end">
          <div className="w-full p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              {hasActiveFilters ? (
                <>
                  <span className="font-semibold text-primary">
                    Filtros activos:
                  </span>
                  {' '}
                  {[
                    filters.search && 'Búsqueda',
                    filters.status && 'Estado',
                    filters.state && 'Ubicación'
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </>
              ) : (
                'Sin filtros aplicados'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Ordenar por:
          </label>
          <div className="flex items-center gap-3 flex-1">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'price')}
              className="flex-1 max-w-xs"
            />
            <button
              onClick={handleToggleSortOrder}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              aria-label={`Ordenar ${sortOrder === 'asc' ? 'ascendente' : 'descendente'}`}
              title={sortOrder === 'asc' ? 'Ascendente (A-Z, 0-9)' : 'Descendente (Z-A, 9-0)'}
            >
              {sortOrder === 'asc' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="text-sm">A-Z</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  <span className="text-sm">Z-A</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
