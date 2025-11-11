/**
 * BulkPatentModal Component
 * Modal for changing patents of multiple properties
 */

import { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import { LoadingSpinner, ComboBox } from '@/components/ui';
import { fetchUniquePatents } from '@/services/api';
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
      const propertyIds = properties.map(p => p.id);
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

  // Show first 5 properties
  const displayProperties = properties.slice(0, 5);
  const remainingCount = properties.length - displayProperties.length;

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
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Cambiar patente
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {properties.length === 1
                    ? '1 propiedad seleccionada'
                    : `${properties.length} propiedades seleccionadas`}
                </p>
              </div>
            </div>
            {!isUpdating && (
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

            {/* Property List Preview */}
            {selectedPatent && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Propiedades que se actualizarán:
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-48 overflow-y-auto">
                  {displayProperties.map((property) => (
                    <div key={property.id} className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">
                          {property.patent || '[sin patente]'}
                        </span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs text-purple-600 font-mono font-medium">
                          {selectedPatent}
                        </span>
                      </div>
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="px-4 py-3 bg-gray-100">
                      <p className="text-sm text-gray-600 text-center">
                        ... y {remainingCount} más
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warning */}
            {selectedPatent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Nota:</span> Todas las propiedades seleccionadas tendrán la patente <span className="font-mono font-bold">{selectedPatent}</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !selectedPatent || loadingPatents}
              className={clsx(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                'bg-purple-600 hover:bg-purple-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2'
              )}
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
