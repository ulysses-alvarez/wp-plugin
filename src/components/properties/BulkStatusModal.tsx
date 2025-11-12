/**
 * BulkStatusModal Component
 * Modal for changing status of multiple properties
 */

import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import type { PropertyStatus } from '@/types/bulk';
import { ComboBox, LoadingSpinner } from '@/components/ui';
import clsx from 'clsx';

interface BulkStatusModalProps {
  isOpen: boolean;
  properties: Property[];
  onClose: () => void;
  onConfirm: (propertyIds: number[], newStatus: PropertyStatus) => Promise<void>;
}

const STATUS_OPTIONS = [
  'Disponible',
  'Vendida',
  'Alquilada',
  'Reservada'
];

const STATUS_VALUES: Record<string, PropertyStatus> = {
  'Disponible': 'available',
  'Vendida': 'sold',
  'Alquilada': 'rented',
  'Reservada': 'reserved'
};

export const BulkStatusModal = ({
  isOpen,
  properties,
  onClose,
  onConfirm,
}: BulkStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<PropertyStatus>('available');
  const [selectedStatusLabel, setSelectedStatusLabel] = useState<string>('Disponible');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = (label: string) => {
    setSelectedStatusLabel(label);
    setSelectedStatus(STATUS_VALUES[label]);
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-200">
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
          <div className="p-4 sm:p-6">
            {/* Status selection */}
            <div className="mb-6">
              <ComboBox
                label="Selecciona el nuevo estado"
                value={selectedStatusLabel}
                options={STATUS_OPTIONS}
                onChange={handleStatusChange}
                placeholder="Buscar estado..."
                disabled={isUpdating}
                required
                helperText="Selecciona el estado que se aplicará a todas las propiedades seleccionadas"
              />
            </div>

            {/* Note */}
            {selectedStatusLabel && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Todas las propiedades seleccionadas cambiarán a estado <span className="font-bold">{selectedStatusLabel}</span>
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
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isUpdating || !selectedStatusLabel}
              className={clsx(
                'px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                isUpdating || !selectedStatusLabel
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-primary text-primary-text hover:bg-primary-hover'
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
