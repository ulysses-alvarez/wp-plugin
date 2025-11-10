/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search and action buttons
 */

import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar } from '@/components/ui';
import { Download, Plus, Upload } from 'lucide-react';
import { canCreateProperty } from '@/utils/permissions';

interface PropertyFiltersProps {
  onCreateNew?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export const PropertyFilters = ({ onCreateNew, onExport, onImport }: PropertyFiltersProps) => {
  const {
    setFieldSearch
  } = usePropertyStore();

  const canCreate = canCreateProperty();

  const handleSearch = (field: string, value: string) => {
    setFieldSearch(field, value);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Section - Left */}
        <div className="flex-1 max-w-2xl">
          <AdvancedSearchBar
            onSearch={handleSearch}
            debounceMs={500}
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
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Exportar
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
