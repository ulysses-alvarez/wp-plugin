/**
 * DropdownMenu Component
 * Simple dropdown menu for mobile actions
 */

import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu = ({
  trigger,
  children,
  align = 'right',
  className
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  return (
    <div ref={menuRef} className={clsx('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm w-full"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <ChevronDown
          size={16}
          className={clsx(
            'transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuItemProps {
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export const DropdownMenuItem = ({
  onClick,
  icon,
  children,
  variant = 'default',
  disabled = false
}: DropdownMenuItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors',
        variant === 'default' &&
          'text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        variant === 'danger' &&
          'text-red-600 hover:bg-red-50 active:bg-red-100',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

