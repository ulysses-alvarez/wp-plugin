/**
 * ExportModal Component
 * Modal for configuring and exporting properties to CSV
 */

import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePropertyStore } from '@/stores/usePropertyStore';
import { LoadingSpinner } from '@/components/ui';
import { DEFAULT_COLUMNS } from '@/utils/csvFormatter';
import { exportPropertiesToCSV } from '@/services/exportService';
import { SEARCH_CONTEXTS } from '@/utils/constants';
import type { Property } from '@/utils/permissions';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties?: Property[];
  onExportComplete?: () => void; // Callback para limpiar selección al exportar desde bulk
}

export const ExportModal = ({ 
  isOpen, 
  onClose, 
  selectedProperties,
  onExportComplete 
}: ExportModalProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    DEFAULT_COLUMNS.map(col => String(col.key))
  );
  const [isExporting, setIsExporting] = useState(false);

  // Get store data
  const properties = usePropertyStore(state => state.properties);
  const filters = usePropertyStore(state => state.filters);
  const total = usePropertyStore(state => state.total);
  const loadProperties = usePropertyStore(state => state.loadProperties);

  if (!isOpen) return null;

  // Determine if exporting selected properties or all/filtered
  const isExportingSelected = selectedProperties && selectedProperties.length > 0;
  const propertiesToExport = isExportingSelected ? selectedProperties : properties;
  const exportCount = isExportingSelected ? selectedProperties!.length : total;

  // Get active filter description
  const getFilterDescription = () => {
    if (isExportingSelected) return null;
    
    if (!filters.searchField || filters.searchField === 'all' || !filters.searchValue) {
      return null;
    }

    const context = SEARCH_CONTEXTS.find(ctx => ctx.value === filters.searchField);
    if (!context) return null;

    let valueLabel = filters.searchValue;

    // If it's a select field, get the label
    if (context.type === 'select' && context.options) {
      const option = context.options.find(opt => opt.value === filters.searchValue);
      valueLabel = option?.label || filters.searchValue;
    }

    return {
      field: context.label,
      value: valueLabel
    };
  };

  const filterDescription = getFilterDescription();

  // Toggle column selection
  const toggleColumn = (columnKey: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Handle export
  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.error('Selecciona al menos una columna para exportar');
      return;
    }

    if (propertiesToExport.length === 0) {
      toast.error('No hay propiedades para exportar');
      return;
    }

    setIsExporting(true);

    try {
      // If not exporting selected, we need to fetch all properties with filters
      let allProperties = propertiesToExport;
      
      if (!isExportingSelected && total > properties.length) {
        // Need to fetch all properties
        toast.loading('Cargando todas las propiedades...', { id: 'loading' });
        await loadProperties({ per_page: total });
        allProperties = usePropertyStore.getState().properties;
        toast.dismiss('loading');
      }

      // Filter columns based on selection
      const columnsToExport = DEFAULT_COLUMNS.filter(col =>
        selectedColumns.includes(String(col.key))
      );

      // Export to CSV
      exportPropertiesToCSV(
        allProperties,
        columnsToExport,
        {
          searchField: filters.searchField,
          searchValue: filters.searchValue
        }
      );

      toast.success(`${allProperties.length} propiedades exportadas correctamente`);
      
      // If exported from bulk actions, call cleanup callback
      if (onExportComplete) {
        onExportComplete();
      }
      
      onClose();
    } catch (error) {
      toast.dismiss('loading');
      toast.error(
        error instanceof Error ? error.message : 'Error al exportar propiedades'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      // If closing from bulk actions, call cleanup callback
      if (isExportingSelected && onExportComplete) {
        onExportComplete();
      }
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-primary-text" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Exportar Propiedades
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isExportingSelected 
                    ? `${exportCount} ${exportCount === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}`
                    : filterDescription 
                      ? `Propiedades filtradas por ${filterDescription.field}`
                      : 'Todas las propiedades'}
                </p>
              </div>
            </div>
            {!isExporting && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Info Banner */}
            {isExportingSelected ? (
              <div className="bg-primary-light border-2 border-primary rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  <strong>Exportando selección:</strong>{' '}
                  <span className="font-semibold text-primary">{exportCount}</span>{' '}
                  {exportCount === 1 ? 'propiedad' : 'propiedades'}
                </p>
              </div>
            ) : filterDescription ? (
              <div className="bg-primary-light border-2 border-primary rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  <strong>Filtro activo:</strong>{' '}
                  <span className="font-medium">{filterDescription.field}</span>:{' '}
                  <span className="font-semibold text-primary">{filterDescription.value}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Se exportarán <strong>{exportCount}</strong> {exportCount === 1 ? 'propiedad' : 'propiedades'}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  <strong>Exportación completa:</strong> Se exportarán{' '}
                  <span className="font-semibold">{exportCount}</span>{' '}
                  {exportCount === 1 ? 'propiedad' : 'propiedades'}
                </p>
              </div>
            )}

            {/* Column Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">
                  Columnas a incluir:
                </label>
                <button
                  onClick={() => {
                    if (selectedColumns.length === DEFAULT_COLUMNS.length) {
                      setSelectedColumns([]);
                    } else {
                      setSelectedColumns(DEFAULT_COLUMNS.map(col => String(col.key)));
                    }
                  }}
                  className="text-xs text-primary hover:text-primary-hover font-medium"
                  disabled={isExporting}
                >
                  {selectedColumns.length === DEFAULT_COLUMNS.length
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pb-2">
                {DEFAULT_COLUMNS.map((column) => {
                  const columnKey = String(column.key);
                  const isSelected = selectedColumns.includes(columnKey);

                  return (
                    <button
                      key={columnKey}
                      type="button"
                      onClick={() => toggleColumn(columnKey)}
                      disabled={isExporting}
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 transition-all',
                        isSelected
                          ? 'bg-primary text-primary-text border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                        isExporting && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {column.label}
                      {isSelected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  {selectedColumns.length} de {DEFAULT_COLUMNS.length} columnas seleccionadas
                </p>
                {selectedColumns.length === 0 && (
                  <p className="text-xs text-red-600">
                    Selecciona al menos una columna
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Botones responsive estandarizados */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || selectedColumns.length === 0 || propertiesToExport.length === 0}
              className={clsx(
                'px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                isExporting || selectedColumns.length === 0 || propertiesToExport.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-primary text-primary-text hover:bg-primary-hover'
              )}
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
