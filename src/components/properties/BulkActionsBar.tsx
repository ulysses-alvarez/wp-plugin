/**
 * BulkActionsBar Component
 * Floating action bar that appears when properties are selected
 */

import { Trash2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onDeselectAll: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  className?: string;
}

export const BulkActionsBar = ({
  selectedCount,
  totalCount,
  onDeselectAll,
  onDelete,
  onStatusChange,
  className,
}: BulkActionsBarProps) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-white rounded-xl shadow-2xl border border-gray-200',
        'px-6 py-4 min-w-[600px] max-w-4xl',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full font-semibold text-sm">
            {selectedCount}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">
              {selectedCount === 1
                ? '1 propiedad seleccionada'
                : `${selectedCount} propiedades seleccionadas`}
            </span>
            {selectedCount < totalCount && (
              <span className="text-xs text-gray-500">
                de {totalCount} totales
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Change Status */}
          <button
            onClick={onStatusChange}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Cambiar estado"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cambiar estado</span>
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            title="Eliminar seleccionadas"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300 mx-2" />

          {/* Deselect All */}
          <button
            onClick={onDeselectAll}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Deseleccionar todas"
          >
            Deseleccionar
          </button>
        </div>
      </div>

      {/* Optional: Banner for selecting all across pages (Phase 4) */}
      {/* This will be implemented in Phase 4 */}
    </div>
  );
};
