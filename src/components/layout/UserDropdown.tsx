/**
 * UserDropdown Component
 * User avatar with dropdown menu for profile and actions
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, HelpCircle, LogOut } from 'lucide-react';
import clsx from 'clsx';

interface UserDropdownProps {
  name: string;
  role: string;
  roleLabel?: string;
  email?: string;
}

export const UserDropdown = ({ name, role, roleLabel, email }: UserDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const displayRole = roleLabel || role;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`${name} (${displayRole})`}
      >
        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-text flex items-center justify-center font-semibold text-sm">
          {getInitials(name)}
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          size={16}
          className={clsx(
            'text-gray-600 transition-transform hidden sm:block',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="font-semibold text-gray-900 text-sm">{name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{displayRole}</div>
            {email && (
              <div className="text-xs text-gray-400 mt-1">{email}</div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Configuración */}
            <a
              href="/wp-admin/admin.php?page=property-dashboard#/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} className="text-gray-400" />
              <span>Configuración</span>
            </a>

            {/* Ayuda */}
            <a
              href="https://wordpress.org/support/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle size={16} className="text-gray-400" />
              <span>Ayuda</span>
            </a>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Cerrar Sesión */}
            <a
              href="/wp-login.php?action=logout"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

