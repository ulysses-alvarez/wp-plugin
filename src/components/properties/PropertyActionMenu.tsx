/**
 * PropertyActionMenu Component
 * Dropdown menu for property actions (mobile/tablet optimized)
 */

import { useState, useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { Property } from '@/utils/permissions';
import clsx from 'clsx';

interface PropertyActionMenuProps {
  property: Property;
  canEdit: boolean;
  canDelete: boolean;
  onView: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
}

export const PropertyActionMenu = ({
  property,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete
}: PropertyActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useClickOutside(menuRef, () => setIsOpen(false), isOpen);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Menu Trigger Button */}
      <button
        onClick={handleToggle}
        className={clsx(
          'p-2 rounded-lg transition-colors',
          isOpen
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        )}
        title="Acciones"
        aria-label="Menú de acciones"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Ver detalles - Always available */}
          <button
            onClick={(e) => handleAction(e, () => onView(property))}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
            role="menuitem"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Ver detalles</span>
          </button>

          {/* Editar - Conditional */}
          {canEdit && onEdit && (
            <button
              onClick={(e) => handleAction(e, () => onEdit(property))}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              role="menuitem"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </button>
          )}

          {/* Descargar ficha - Conditional */}
          {property.attachment_url && (
            <a
              href={property.attachment_url}
              download
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3"
              role="menuitem"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar ficha</span>
            </a>
          )}

          {/* Divider if delete is available */}
          {canDelete && onDelete && (
            <>
              <div className="border-t border-gray-200 my-1" />
              
              {/* Eliminar - Conditional */}
              <button
                onClick={(e) => handleAction(e, () => onDelete(property))}
                className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors flex items-center gap-3"
                role="menuitem"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Eliminar</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

