/**
 * PropertyFilters Component
 * Filter controls for properties with advanced search and action buttons
 */

import { useCallback, useMemo } from 'react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { AdvancedSearchBar, FilterDropdown } from '@/components/ui';
import type { FilterOption } from '@/components/ui';
import { Download, Plus, Upload, Users, ArrowUpDown, Calendar, DollarSign, Type } from 'lucide-react';
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
  const setSortBy = usePropertyStore(state => state.setSortBy);
  const setSortOrder = usePropertyStore(state => state.setSortOrder);
  const total = usePropertyStore(state => state.total);
  const filters = usePropertyStore(state => state.filters);
  const sortBy = usePropertyStore(state => state.sortBy);
  const sortOrder = usePropertyStore(state => state.sortOrder);

  const canCreate = canCreateProperty();

  // Check if there's an active filter
  const hasActiveFilter = filters.searchField &&
                          filters.searchField !== 'all' &&
                          filters.searchValue;

  const handleSearch = useCallback((field: string, value: string) => {
    setFieldSearch(field, value);
  }, [setFieldSearch]);

  // View filter options
  const viewOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'Todas', icon: <Users className="w-4 h-4" /> },
    { value: 'mine', label: 'Solo mías', icon: <Users className="w-4 h-4" /> }
  ], []);

  // Sort options
  const sortOptions: FilterOption[] = useMemo(() => [
    { value: 'date-desc', label: 'Más recientes', icon: <Calendar className="w-4 h-4" /> },
    { value: 'date-asc', label: 'Más antiguas', icon: <Calendar className="w-4 h-4" /> },
    { value: 'title-asc', label: 'Título (A → Z)', icon: <Type className="w-4 h-4" /> },
    { value: 'title-desc', label: 'Título (Z → A)', icon: <Type className="w-4 h-4" /> },
    { value: 'price-desc', label: 'Precio (mayor)', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'price-asc', label: 'Precio (menor)', icon: <DollarSign className="w-4 h-4" /> }
  ], []);

  // Current view filter value
  const currentViewFilter = filters.onlyMyProperties ? 'mine' : 'all';

  // Current sort value
  const currentSortValue = `${sortBy}-${sortOrder}`;

  // Handle view filter change
  const handleViewFilterChange = useCallback((value: string) => {
    setOnlyMyProperties(value === 'mine');
  }, [setOnlyMyProperties]);

  // Handle sort change
  const handleSortChange = useCallback((value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [any, 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, [setSortBy, setSortOrder]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      {/* Desktop: Una sola fila */}
      <div className="hidden md:flex items-start justify-between gap-4">
        {/* Izquierda: Search + Dropdowns */}
        <div className="flex-1 flex items-start gap-3 max-w-3xl">
          <div className="flex-1 max-w-2xl">
            <AdvancedSearchBar
              onSearch={handleSearch}
              debounceMs={300}
            />
          </div>

          {/* Dropdown: Vista (Todas/Mis propiedades) */}
          <FilterDropdown
            icon={<Users className="w-4 h-4" />}
            options={viewOptions}
            value={currentViewFilter}
            onChange={handleViewFilterChange}
          />

          {/* Dropdown: Ordenamiento */}
          <FilterDropdown
            icon={<ArrowUpDown className="w-4 h-4" />}
            options={sortOptions}
            value={currentSortValue}
            onChange={handleSortChange}
          />
        </div>

        {/* Derecha: Botones de acción */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Importar - SOLO en desktop - Oculto por defecto (puede mostrarse con dev tools) */}
          {onImport && canCreate && (
            <button
              onClick={onImport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium items-center gap-2 text-sm inline-flex"
              style={{ display: 'none' }}
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

      {/* Mobile: Layout compacto */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Fila 1: Dropdowns + Botones */}
        <div className="flex items-center justify-between gap-2">
          {/* Izquierda: Dropdowns compactos */}
          <div className="flex gap-2">
            <FilterDropdown
              icon={<Users className="w-4 h-4" />}
              options={viewOptions}
              value={currentViewFilter}
              onChange={handleViewFilterChange}
            />
            <FilterDropdown
              icon={<ArrowUpDown className="w-4 h-4" />}
              options={sortOptions}
              value={currentSortValue}
              onChange={handleSortChange}
            />
          </div>

          {/* Derecha: Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Exportar - Mobile */}
            {onExport && (
              <button
                onClick={onExport}
                className={clsx(
                  'p-2 rounded-lg transition-colors flex items-center',
                  hasActiveFilter
                    ? 'border-2 border-primary text-primary'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
                title={hasActiveFilter ? 'Exportar propiedades filtradas' : 'Exportar todas las propiedades'}
                aria-label="Exportar"
              >
                <Download size={18} />
              </button>
            )}

            {/* Agregar - Mobile */}
            {canCreate && onCreateNew && (
              <button
                onClick={onCreateNew}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                aria-label="Agregar propiedad"
              >
                <Plus size={18} />
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
