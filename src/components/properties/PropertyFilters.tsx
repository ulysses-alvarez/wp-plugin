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
  const setOnlyMyProperties = usePropertyStore(state => state.setOnlyMyProperties);
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
      {/* Desktop: Layout */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Fila 1: Tabs y Botones */}
        <div className="flex items-center justify-between">
          {/* Izquierda: Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setOnlyMyProperties(false)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                !filters.onlyMyProperties
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setOnlyMyProperties(true)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filters.onlyMyProperties
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Mis propiedades
            </button>
          </div>

          {/* Derecha: Botones de acción */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Importar - SOLO en desktop */}
            {onImport && canCreate && (
              <button
                onClick={onImport}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium items-center gap-2 text-sm inline-flex"
              >
                <Upload size={16} />
                <span>Importar</span>
              </button>
            )}

            {/* Exportar */}
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
                <span>Exportar</span>
                {total > 0 && hasActiveFilter && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary text-white rounded text-xs font-semibold">
                    {total}
                  </span>
                )}
              </button>
            )}

            {/* Agregar */}
            {canCreate && onCreateNew && (
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Plus size={16} />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Fila 2: Buscador */}
        <div className="w-full">
          <AdvancedSearchBar
            onSearch={handleSearch}
            debounceMs={300}
          />
        </div>
      </div>

      {/* Mobile: Layout vertical */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Fila 1: Tabs y Botones */}
        <div className="flex items-center justify-between gap-2">
          {/* Izquierda: Tabs compactos */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setOnlyMyProperties(false)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                !filters.onlyMyProperties
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setOnlyMyProperties(true)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                filters.onlyMyProperties
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              Mis prop.
            </button>
          </div>

          {/* Derecha: Botones de acción */}
          <div className="flex items-center gap-2 sm:gap-3">
          {/* Exportar - En mobile */}
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

          {/* Agregar - Mobile */}
          {canCreate && onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </button>
          )}
          </div>
        </div>

        {/* Fila 2: Buscador - Ancho completo */}
        <div className="w-full">
          <AdvancedSearchBar
            onSearch={handleSearch}
            debounceMs={300}
          />
        </div>
      </div>
    </div>
  );
};
