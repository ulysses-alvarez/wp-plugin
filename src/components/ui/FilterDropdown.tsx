/**
 * FilterDropdown Component
 * Generic dropdown for filters and sorting options
 */

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterDropdownProps {
  icon: React.ReactNode;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const FilterDropdown = ({
  icon,
  options,
  value,
  onChange,
  className
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Trigger Button - Icon only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center justify-center px-2 sm:px-3 py-2.5 rounded-lg border transition-colors',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          isOpen
            ? 'border-primary bg-gray-50 text-primary'
            : 'border-gray-300 bg-white text-gray-700'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={selectedOption?.label}
      >
        {icon}
      </button>

      {/* Dropdown Menu - fit-content width */}
      {isOpen && (
        <div
          className={clsx(
            'absolute left-0 sm:right-0 sm:left-auto mt-2 w-max min-w-[12rem] rounded-lg shadow-lg bg-white border border-gray-200',
            'animate-in fade-in slide-in-from-top-2 duration-200',
            'z-50'
          )}
          role="listbox"
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3 whitespace-nowrap',
                  'hover:bg-gray-50',
                  value === option.value
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-700'
                )}
                role="option"
                aria-selected={value === option.value}
              >
                <span className="flex-1">{option.label}</span>
                {value === option.value && (
                  <svg
                    className="w-4 h-4 text-primary flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
