/**
 * BulkActionsBar Component
 * Floating action bar that appears when properties are selected
 */

import { Trash2, RefreshCw, Tag, Download, FileDown, X } from 'lucide-react';
import clsx from 'clsx';
import { BulkActionSelect, type BulkActionOption } from '@/components/ui';

interface BulkActionsBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  onPatentChange: () => void;
  onDownloadSheets: () => void;
  onExport: () => void;
  className?: string;
}

export const BulkActionsBar = ({
  selectedCount,
  onDeselectAll,
  onDelete,
  onStatusChange,
  onPatentChange,
  onDownloadSheets,
  onExport,
  className,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) {
    return null;
  }

  // Define bulk action options
  const bulkActions: BulkActionOption[] = [
    {
      id: 'status',
      label: 'Estado',
      icon: RefreshCw,
      action: onStatusChange,
    },
    {
      id: 'patent',
      label: 'Patente',
      icon: Tag,
      action: onPatentChange,
    },
    {
      id: 'export',
      label: 'Exportar CSV',
      icon: FileDown,
      action: onExport,
    },
    {
      id: 'download',
      label: 'Descargar Fichas',
      icon: Download,
      action: onDownloadSheets,
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: Trash2,
      color: 'danger' as const,
      action: onDelete,
    },
  ];

  return (
    <div
      className={clsx(
        'fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50',
        'bg-white rounded-xl shadow-2xl border border-gray-200',
        'px-3 py-3 sm:px-6 sm:py-4',
        'sm:min-w-[500px] sm:max-w-4xl w-auto',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      {/* Mobile: 2 filas | Desktop: 1 fila */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
        
        {/* Fila 1 mobile / Izquierda desktop: Contador + texto + X en mobile */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full font-semibold text-xs sm:text-sm">
              {selectedCount}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-900">
              {/* Mobile: "5 seleccionadas" | Desktop: "5 propiedades seleccionadas" */}
              <span className="sm:hidden">{selectedCount} seleccionadas</span>
              <span className="hidden sm:inline">
                {selectedCount === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}
              </span>
            </span>
          </div>
          
          {/* X - Solo en mobile aquí */}
          <button
            onClick={onDeselectAll}
            className="sm:hidden flex items-center justify-center w-7 h-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Deseleccionar todas"
            aria-label="Deseleccionar todas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fila 2 mobile / Derecha desktop: Selector + X */}
        <div className="flex items-center gap-2 sm:gap-3">
          <BulkActionSelect
            options={bulkActions}
            placeholder="Seleccionar acción"
          />
          
          {/* Divider + X - Solo en desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-8 bg-gray-300" />
            <button
              onClick={onDeselectAll}
              className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Deseleccionar todas"
              aria-label="Deseleccionar todas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Banner for selecting all across pages (Phase 4) */}
      {/* This will be implemented in Phase 4 */}
    </div>
  );
};
