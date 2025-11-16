/**
 * PropertySidebar Component (Wrapper)
 * Displays detailed property information or form in a sidebar
 * Supports three modes: view, create, edit
 * Delegates to PropertyViewSidebar or PropertyFormSidebar
 */

import { useEffect } from 'react';
import type { Property } from '@/utils/permissions';
import type { PropertyFormData } from './PropertyForm';
import { PropertyViewSidebar } from './PropertyViewSidebar';
import { PropertyFormSidebar } from './PropertyFormSidebar';
import clsx from 'clsx';

type SidebarMode = 'view' | 'create' | 'edit';

interface PropertySidebarProps {
  property: Property | null;
  isOpen: boolean;
  mode?: SidebarMode;
  onClose: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onSubmit?: (data: PropertyFormData) => Promise<void>;
  loading?: boolean;
}

export const PropertySidebar = ({
  property,
  isOpen,
  mode = 'view',
  onClose,
  onEdit,
  onDelete,
  onSubmit,
  loading = false
}: PropertySidebarProps) => {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Get title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Nueva Propiedad';
      case 'edit':
        return 'Editar Propiedad';
      default:
        return 'Detalles de la Propiedad';
    }
  };

  // Handle form submit
  const handleFormSubmit = async (data: PropertyFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  // Don't render if no property in view mode
  if (mode === 'view' && !property) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-xl transform transition-transform duration-300 z-50 flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Delegated to specialized components */}
        {mode === 'view' && property && (
          <PropertyViewSidebar
            property={property}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}

        {(mode === 'create' || mode === 'edit') && (
          <PropertyFormSidebar
            property={property}
            mode={mode}
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            loading={loading}
          />
        )}
      </div>
    </>
  );
};
