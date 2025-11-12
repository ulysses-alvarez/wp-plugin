/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search and action buttons
 */

import { useCallback } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar } from '@/components/ui';
import { Download, Plus, Upload } from 'lucide-react';
import { canCreateProperty } from '@/utils/permissions';
import clsx from 'clsx';

interface PropertyFiltersProps {
  onCreateNew?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export const PropertyFilters = ({ onCreateNew, onExport, onImport }: PropertyFiltersProps) => {
  const setFieldSearch = usePropertyStore(state => state.setFieldSearch);
  const total = usePropertyStore(state => state.total);
  const filters = usePropertyStore(state => state.filters);

  const canCreate = canCreateProperty();

  // Check if there's an active filter
  const hasActiveFilter = filters.searchField && 
                          filters.searchField !== 'all' && 
                          filters.searchValue;

  const handleSearch = useCallback((field: string, value: string) => {
    setFieldSearch(field, value);
  }, [setFieldSearch]);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Section - Left */}
        <div className="flex-1 max-w-2xl">
          <AdvancedSearchBar
            onSearch={handleSearch}
            debounceMs={300}
          />
        </div>

        {/* Action Buttons - Right */}
        <div className="flex items-center gap-3">
          {onImport && canCreate && (
            <button
              onClick={onImport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              Importar
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className={clsx(
                'px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm',
                hasActiveFilter
                  ? 'border-2 border-primary text-primary'
                  : 'border border-gray-300 text-gray-700'
              )}
              title={hasActiveFilter ? 'Exportar propiedades filtradas' : 'Exportar todas las propiedades'}
            >
              <Download size={16} />
              Exportar
              {total > 0 && hasActiveFilter && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-white rounded text-xs font-semibold">
                  {total}
                </span>
              )}
            </button>
          )}

          {canCreate && onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Agregar Propiedad
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
