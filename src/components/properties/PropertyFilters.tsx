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
    setSearch,
    setStatusFilter,
    setStateFilter,
    clearFilters,
    loadProperties
  } = usePropertyStore();

  const hasActiveFilters = filters.search || filters.status || filters.state;

  // Reload properties when filters change
  useEffect(() => {
    loadProperties();
  }, [filters, loadProperties]);

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
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
    </div>
  );
};
