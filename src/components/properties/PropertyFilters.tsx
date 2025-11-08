/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search
 */

import { useEffect } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar } from '@/components/ui';

export const PropertyFilters = () => {
  const {
    filters,
    setFieldSearch,
    clearFilters,
    loadProperties
  } = usePropertyStore();

  const hasActiveFilters = filters.searchField && filters.searchValue;

  // Reload properties when filters change
  useEffect(() => {
    loadProperties();
  }, [filters, loadProperties]);

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleSearch = (field: string, value: string) => {
    setFieldSearch(field, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Búsqueda Avanzada</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>

      <AdvancedSearchBar
        onSearch={handleSearch}
        debounceMs={500}
      />
    </div>
  );
};
