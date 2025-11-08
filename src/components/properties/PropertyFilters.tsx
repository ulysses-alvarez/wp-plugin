/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search
 */

import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar } from '@/components/ui';

export const PropertyFilters = () => {
  const {
    setFieldSearch
  } = usePropertyStore();

  const handleSearch = (field: string, value: string) => {
    setFieldSearch(field, value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Búsqueda Avanzada</h3>

      <AdvancedSearchBar
        onSearch={handleSearch}
        debounceMs={500}
      />
    </div>
  );
};
