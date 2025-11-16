/**
 * PropertyFormSidebar Component
 * Form for creating and editing properties in sidebar modes
 */

import { useRef } from 'react';
import type { Property } from '@/utils/permissions';
import { Button } from '@/components/ui';
import { PropertyForm } from './PropertyForm';
import type { PropertyFormData } from './PropertyForm';

type FormMode = 'create' | 'edit';

interface PropertyFormSidebarProps {
  property: Property | null;
  mode: FormMode;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  uploadProgress?: number;
  isUploading?: boolean;
}

export const PropertyFormSidebar = ({
  property,
  mode,
  onSubmit,
  onCancel,
  loading = false,
  uploadProgress = 0,
  isUploading = false
}: PropertyFormSidebarProps) => {
  // Form ref to trigger submit from footer button
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form submit
  const handleFormSubmit = async (data: PropertyFormData) => {
    await onSubmit(data);
  };

  // Handle footer submit button click
  const handleFooterSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <PropertyForm
          ref={formRef}
          property={property}
          mode={mode}
          onSubmit={handleFormSubmit}
          loading={loading}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleFooterSubmit}
          disabled={loading || isUploading}
          loading={loading || isUploading}
        >
          {isUploading
            ? `Subiendo archivo (${uploadProgress}%)...`
            : loading
              ? 'Guardando...'
              : mode === 'create'
                ? 'Crear Propiedad'
                : 'Actualizar Propiedad'
          }
        </Button>
      </div>
    </>
  );
};
