/**
 * BulkStatusModal Component
 * Modal for changing status of multiple properties
 */

import { useState } from 'react';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import type { PropertyStatus } from '@/types/bulk';
import { LoadingSpinner } from '@/components/ui';
import clsx from 'clsx';

interface BulkStatusModalProps {
  isOpen: boolean;
  properties: Property[];
  onClose: () => void;
  onConfirm: (propertyIds: number[], newStatus: PropertyStatus) => Promise<void>;
}

const STATUS_OPTIONS: Array<{
  value: PropertyStatus;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'available',
    label: 'Disponible',
    description: 'Propiedad disponible para venta/renta',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    value: 'sold',
    label: 'Vendida',
    description: 'Propiedad vendida',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    value: 'rented',
    label: 'Alquilada',
    description: 'Propiedad en renta',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    value: 'reserved',
    label: 'Reservada',
    description: 'Propiedad reservada',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
];

export const BulkStatusModal = ({
  isOpen,
  properties,
  onClose,
  onConfirm,
}: BulkStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>('available');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsUpdating(true);
    try {
      const propertyIds = properties.map((p) => p.id);
      await onConfirm(propertyIds, selectedStatus);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-light rounded-full">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Cambiar estado
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Actualizar el estado de {properties.length}{' '}
                  {properties.length === 1 ? 'propiedad' : 'propiedades'}
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
            {/* Status selection */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Nuevo estado:
              </h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={clsx(
                      'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      selectedStatus === option.value
                        ? 'border-primary bg-primary-light'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={selectedStatus === option.value}
                      onChange={(e) =>
                        setSelectedStatus(e.target.value as PropertyStatus)
                      }
                      className="mt-1 w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {option.label}
                        </span>
                        {selectedStatus === option.value && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                isUpdating
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating}
              className={clsx(
                'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2',
                isUpdating
                  ? 'bg-primary-hover cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover'
              )}
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Aplicar cambio</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
