/**
 * BulkDeleteModal Component
 * Confirmation modal for bulk delete operations
 */

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import { LoadingSpinner } from '@/components/ui';
import clsx from 'clsx';

interface BulkDeleteModalProps {
  isOpen: boolean;
  properties: Property[];
  onClose: () => void;
  onConfirm: (propertyIds: number[]) => Promise<void>;
}

export const BulkDeleteModal = ({
  isOpen,
  properties,
  onClose,
  onConfirm,
}: BulkDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      const propertyIds = properties.map((p) => p.id);
      await onConfirm(propertyIds);
      onClose();
    } catch {
      // Error is handled by the store
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
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
          aria-labelledby="bulk-delete-modal-title"
          aria-describedby="bulk-delete-modal-description"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div>
                <h2 id="bulk-delete-modal-title" className="text-xl font-semibold text-gray-900">
                  Eliminar propiedades
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Esta acción NO se puede deshacer
                </p>
              </div>
            </div>
            {!isDeleting && (
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
            <p id="bulk-delete-modal-description" className="text-sm text-gray-700 mb-4">
              Vas a eliminar{' '}
              <span className="font-semibold text-red-600">
                {properties.length === 1
                  ? '1 propiedad'
                  : `${properties.length} propiedades`}
              </span>
              .
            </p>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Esta acción eliminará
                permanentemente las propiedades seleccionadas. No podrás
                recuperarlas después.
              </p>
            </div>
          </div>

          {/* Footer - Botones responsive estandarizados */}
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className={clsx(
                'px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors',
                isDeleting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
              aria-label="Cancelar eliminación"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={clsx(
                'px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
                isDeleting
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              )}
              aria-label={`Confirmar eliminación de ${properties.length} ${properties.length === 1 ? 'propiedad' : 'propiedades'}`}
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <span>
                  Sí, eliminar{' '}
                  {properties.length === 1
                    ? '1 propiedad'
                    : `${properties.length} propiedades`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
