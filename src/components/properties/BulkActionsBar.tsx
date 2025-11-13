/**
 * BulkActionsBar Component
 * Floating action bar that appears when properties are selected
 */

import { useMemo } from 'react';
import { Trash2, RefreshCw, Tag, Download, FileDown, X } from 'lucide-react';
import clsx from 'clsx';
import { BulkActionSelect, type BulkActionOption } from '@/components/ui';
import type { Property } from '@/utils/permissions';
import { canEditProperty, canDeleteProperty, can } from '@/utils/permissions';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedProperties: Property[];
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
  selectedProperties,
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

  // Calculate which bulk actions are available based on permissions
  const permissions = useMemo(() => {
    return {
      canEditAll: selectedProperties.every(prop => canEditProperty(prop)),
      canDeleteAll: selectedProperties.every(prop => canDeleteProperty(prop)),
      canExport: can('export_properties'),
      editableCount: selectedProperties.filter(prop => canEditProperty(prop)).length,
      deletableCount: selectedProperties.filter(prop => canDeleteProperty(prop)).length,
    };
  }, [selectedProperties]);

  // Define bulk action options with conditional disabled state
  const bulkActions: BulkActionOption[] = [
    {
      id: 'status',
      label: permissions.canEditAll ? 'Estado' : `Estado (${permissions.editableCount}/${selectedCount})`,
      icon: RefreshCw,
      action: onStatusChange,
      disabled: !permissions.canEditAll,
    },
    {
      id: 'patent',
      label: permissions.canEditAll ? 'Patente' : `Patente (${permissions.editableCount}/${selectedCount})`,
      icon: Tag,
      action: onPatentChange,
      disabled: !permissions.canEditAll,
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: FileDown,
      action: onExport,
      disabled: !permissions.canExport,
    },
    {
      id: 'download',
      label: 'Descargar Fichas',
      icon: Download,
      action: onDownloadSheets,
    },
    {
      id: 'delete',
      label: permissions.canDeleteAll ? 'Eliminar' : `Eliminar (${permissions.deletableCount}/${selectedCount})`,
      icon: Trash2,
      color: 'danger' as const,
      action: onDelete,
      disabled: !permissions.canDeleteAll,
    },
  ];

  return (
    <div
      className={clsx(
        'fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-white rounded-xl shadow-2xl border border-gray-200',
        'px-3 py-2.5 sm:px-6 sm:py-4',
        'w-fit max-w-[calc(100vw-2rem)]',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      {/* Mobile: 1 fila | Desktop: 1 fila con texto */}
      <div className="flex items-center gap-2 sm:gap-6">
        
        {/* Badge con número - Siempre visible */}
        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary text-white rounded-full font-semibold text-xs sm:text-sm flex-shrink-0">
          {selectedCount}
        </div>
        
        {/* Texto - Solo en desktop */}
        <span className="hidden sm:inline text-sm font-semibold text-gray-900 whitespace-nowrap">
          {selectedCount === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}
        </span>
        
        {/* Divider - Solo desktop */}
        <div className="hidden sm:block w-px h-8 bg-gray-300" />
        
        {/* Select - Compacto en mobile, normal en desktop */}
        <div className="flex-1 sm:flex-initial min-w-0">
          <BulkActionSelect
            options={bulkActions}
            placeholder="Seleccionar acción"
          />
        </div>
        
        {/* X - Siempre visible */}
        <button
          onClick={onDeselectAll}
          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Deseleccionar todas"
          aria-label="Deseleccionar todas"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Optional: Banner for selecting all across pages (Phase 4) */}
      {/* This will be implemented in Phase 4 */}
    </div>
  );
};
