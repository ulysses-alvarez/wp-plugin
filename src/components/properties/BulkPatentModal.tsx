/**
 * BulkPatentModal Component
 * Modal for changing patents of multiple properties
 */

import { useState, useEffect, useMemo } from 'react';
import { Tag, X, AlertCircle } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import { LoadingSpinner, ComboBox } from '@/components/ui';
import { fetchUniquePatents } from '@/services/api';
import { canEditProperty } from '@/utils/permissions';
import clsx from 'clsx';

interface BulkPatentModalProps {
  isOpen: boolean;
  properties: Property[];
  onClose: () => void;
  onConfirm: (propertyIds: number[], patent: string) => Promise<void>;
}

export const BulkPatentModal = ({
  isOpen,
  properties,
  onClose,
  onConfirm,
}: BulkPatentModalProps) => {
  const [selectedPatent, setSelectedPatent] = useState('');
  const [uniquePatents, setUniquePatents] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingPatents, setLoadingPatents] = useState(true);

  // Calculate editable vs non-editable properties
  const propertyPermissions = useMemo(() => {
    const editableProperties = properties.filter(p => canEditProperty(p));
    const nonEditableProperties = properties.filter(p => !canEditProperty(p));
    return {
      editable: editableProperties,
      nonEditable: nonEditableProperties,
      editableCount: editableProperties.length,
      nonEditableCount: nonEditableProperties.length,
      hasNonEditable: nonEditableProperties.length > 0
    };
  }, [properties]);

  // Load unique patents when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingPatents(true);
      setSelectedPatent('');
      fetchUniquePatents()
        .then(patents => {
          setUniquePatents(patents);
          setLoadingPatents(false);
        })
        .catch(() => {
          setLoadingPatents(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedPatent.trim()) return;

    setIsUpdating(true);
    try {
      // Only send editable properties to the backend
      const propertyIds = propertyPermissions.editable.map(p => p.id);
      await onConfirm(propertyIds, selectedPatent);
      onClose();
    } catch {
      // Error is handled by the store
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full sm:w-fit pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-patent-modal-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-light rounded-full">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 id="bulk-patent-modal-title" className="text-xl font-semibold text-gray-900">
                  Cambiar patente
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {propertyPermissions.hasNonEditable ? (
                    <>
                      Actualizar la patente de {propertyPermissions.editableCount}{' '}
                      de {properties.length}{' '}
                      {properties.length === 1 ? 'propiedad seleccionada' : 'propiedades seleccionadas'}
                    </>
                  ) : (
                    <>
                      {properties.length === 1
                        ? '1 propiedad seleccionada'
                        : `${properties.length} propiedades seleccionadas`}
                    </>
                  )}
                </p>
              </div>
            </div>
            {!isUpdating && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Patent Selection */}
            <div className="mb-6">
              {loadingPatents ? (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-gray-500">Cargando patentes...</span>
                </div>
              ) : uniquePatents.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No hay patentes disponibles. Crea propiedades con patentes primero.
                  </p>
                </div>
              ) : (
                <ComboBox
                  label="Selecciona la nueva patente"
                  value={selectedPatent}
                  options={uniquePatents}
                  onChange={setSelectedPatent}
                  placeholder="Buscar patente..."
                  disabled={isUpdating}
                  required
                  helperText="Selecciona una patente existente para aplicar a todas las propiedades seleccionadas"
                  emptyMessage="No hay patentes disponibles"
                />
              )}
            </div>

            {/* Warning for non-editable properties */}
            {propertyPermissions.hasNonEditable && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4" role="alert">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Propiedades omitidas</p>
                    <p>
                      {propertyPermissions.nonEditableCount}{' '}
                      {propertyPermissions.nonEditableCount === 1 ? 'propiedad será omitida' : 'propiedades serán omitidas'}{' '}
                      porque no tienes permisos para editarlas.
                    </p>
                    <p className="mt-1">
                      Solo se actualizarán {propertyPermissions.editableCount}{' '}
                      {propertyPermissions.editableCount === 1 ? 'propiedad' : 'propiedades'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            {selectedPatent && !propertyPermissions.hasNonEditable && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" role="status" aria-live="polite">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Todas las propiedades seleccionadas tendrán la patente <span className="font-mono font-bold">{selectedPatent}</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer - Botones responsive estandarizados */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancelar cambio de patente"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !selectedPatent || loadingPatents}
              className={clsx(
                'px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors',
                'bg-primary text-primary-text hover:bg-primary-hover',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
              aria-label={`Aplicar patente ${selectedPatent} a ${properties.length} ${properties.length === 1 ? 'propiedad' : 'propiedades'}`}
            >
              {isUpdating && <LoadingSpinner size="sm" />}
              {isUpdating ? 'Actualizando...' : 'Aplicar cambio'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
