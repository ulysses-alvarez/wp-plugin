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
    } catch (error) {
      console.error('Error deleting properties:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  // Show first 5 properties, then count
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
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
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
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3">
                Vas a eliminar{' '}
                <span className="font-semibold text-red-600">
                  {properties.length === 1
                    ? '1 propiedad'
                    : `${properties.length} propiedades`}
                </span>
                :
              </p>

              {/* Property list */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {displayProperties.map((property) => (
                    <li
                      key={property.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-gray-400 mt-0.5">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">
                          {property.title}
                        </span>
                        {property.patent && (
                          <span className="text-gray-500 ml-2">
                            (Patente: {property.patent})
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                  {remainingCount > 0 && (
                    <li className="text-sm text-gray-500 font-medium">
                      ... y {remainingCount} más
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>⚠️ Advertencia:</strong> Esta acción eliminará
                permanentemente las propiedades seleccionadas. No podrás
                recuperarlas después.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isDeleting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={clsx(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
                isDeleting
                  ? 'bg-red-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              )}
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
