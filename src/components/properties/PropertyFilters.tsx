/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search and action buttons
 */

import { useCallback } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar, DropdownMenu, DropdownMenuItem } from '@/components/ui';
import { Download, Plus, Upload, Menu } from 'lucide-react';
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
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      {/* Desktop: justify-between | Mobile: column con dropdown */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center md:justify-between gap-3 md:gap-4">
        
        {/* Buscador */}
        <div className="flex-1 w-full md:max-w-2xl">
          <AdvancedSearchBar
            onSearch={handleSearch}
            debounceMs={300}
          />
        </div>

        {/* Botones: Dropdown en mobile, botones normales en desktop */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Mobile: Dropdown Menu */}
          <div className="md:hidden w-full">
            <DropdownMenu trigger={
              <>
                <Menu size={16} />
                <span>Acciones</span>
              </>
            }>
              {onImport && canCreate && (
                <DropdownMenuItem
                  onClick={onImport}
                  icon={<Upload size={18} />}
                >
                  Importar CSV
                </DropdownMenuItem>
              )}
              
              {onExport && (
                <DropdownMenuItem
                  onClick={onExport}
                  icon={<Download size={18} />}
                >
                  Exportar CSV
                  {total > 0 && hasActiveFilter && (
                    <span className="ml-auto px-1.5 py-0.5 bg-primary text-white rounded text-xs font-semibold">
                      {total}
                    </span>
                  )}
                </DropdownMenuItem>
              )}
              
              {canCreate && onCreateNew && (
                <DropdownMenuItem
                  onClick={onCreateNew}
                  icon={<Plus size={18} />}
                >
                  Agregar Propiedad
                </DropdownMenuItem>
              )}
            </DropdownMenu>
          </div>

          {/* Desktop: Botones normales en línea */}
          <div className="hidden md:flex items-center gap-3">
            {onImport && canCreate && (
              <button
                onClick={onImport}
                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Upload size={16} />
                <span>Importar</span>
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                className={clsx(
                  'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 text-sm',
                  hasActiveFilter
                    ? 'border-2 border-primary text-primary'
                    : 'border border-gray-300 text-gray-700'
                )}
                title={hasActiveFilter ? 'Exportar propiedades filtradas' : 'Exportar todas las propiedades'}
              >
                <Download size={16} />
                <span>Exportar</span>
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span>Agregar Propiedad</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
