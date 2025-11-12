/**
 * BulkActionsBar Component
 * Floating action bar that appears when properties are selected
 */

import { Trash2, RefreshCw, Tag, Download, X } from 'lucide-react';
import clsx from 'clsx';
import { BulkActionSelect, type BulkActionOption } from '@/components/ui';

interface BulkActionsBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  onPatentChange: () => void;
  onDownloadSheets: () => void;
  className?: string;
}

export const BulkActionsBar = ({
  selectedCount,
  onDeselectAll,
  onDelete,
  onStatusChange,
  onPatentChange,
  onDownloadSheets,
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
      id: 'download',
      label: 'Descargar',
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
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-white rounded-xl shadow-2xl border border-gray-200',
        'px-6 py-4 min-w-[500px] max-w-4xl',
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
                ? 'propiedad seleccionada'
                : 'propiedades seleccionadas'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Bulk Action Select */}
          <BulkActionSelect
            options={bulkActions}
            placeholder="Seleccionar acción"
          />

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300" />

          {/* Deselect All */}
          <button
            onClick={onDeselectAll}
            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Deseleccionar todas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Optional: Banner for selecting all across pages (Phase 4) */}
      {/* This will be implemented in Phase 4 */}
    </div>
  );
};
