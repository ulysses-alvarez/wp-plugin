/**
 * BulkStatusModal Component
 * Modal for changing status of multiple properties
 */

import { useState } from 'react';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';
import type { Property } from '@/utils/permissions';
import type { PropertyStatus } from '@/types/bulk';
import { LoadingSpinner, Badge } from '@/components/ui';
import { getStatusLabel } from '@/utils/permissions';
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

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'sold':
      return 'danger';
    case 'rented':
      return 'warning';
    case 'reserved':
      return 'info';
    default:
      return 'default';
  }
};

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
    } catch (error) {
      console.error('Error updating property statuses:', error);
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

  // Count properties by current status
  const statusCounts = properties.reduce((acc, prop) => {
    acc[prop.status] = (acc[prop.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <RefreshCw className="w-6 h-6 text-blue-600" />
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
            {/* Current status summary */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Estados actuales:
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant={getStatusVariant(status)}>
                      {getStatusLabel(status as PropertyStatus)}
                    </Badge>
                    <span className="text-gray-600">×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status selection */}
            <div className="mb-6">
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

            {/* Property preview */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Propiedades afectadas:
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <ul className="space-y-1.5">
                  {displayProperties.map((property) => (
                    <li
                      key={property.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-900">{property.title}</span>
                      {property.patent && (
                        <span className="text-gray-500 text-xs">
                          ({property.patent})
                        </span>
                      )}
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
