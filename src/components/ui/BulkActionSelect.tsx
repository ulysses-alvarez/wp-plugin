/**
 * BulkActionSelect Component
 * Custom select component for bulk actions with icons and modern UI
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface BulkActionOption {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: 'default' | 'danger';
  action: () => void;
}

interface BulkActionSelectProps {
  options: BulkActionOption[];
  placeholder?: string;
  className?: string;
}

export const BulkActionSelect = ({
  options,
  placeholder = 'Seleccionar acción',
  className,
}: BulkActionSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option: BulkActionOption) => {
    option.action();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium rounded-lg transition-all',
          'bg-white text-gray-700 border border-gray-300',
          'hover:bg-gray-50',
          'focus:outline-none',
          'w-[176px] sm:w-auto',
          isOpen && 'bg-gray-50 border-gray-400'
        )}
      >
        <span>{placeholder}</span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-[168px] sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
          {options.map((option) => {
            const Icon = option.icon;
            const isDanger = option.color === 'danger';

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={clsx(
                  'w-full flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium transition-colors',
                  isDanger
                    ? 'text-red-700 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className={clsx(
                  'w-4 h-4',
                  isDanger ? 'text-red-600' : 'text-primary'
                )} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

