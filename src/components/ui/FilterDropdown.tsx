/**
 * FilterDropdown Component
 * Generic dropdown for filters and sorting options
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm',
          'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
          isOpen
            ? 'border-primary bg-gray-50'
            : 'border-gray-300 bg-white text-gray-700'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-600">{icon}</span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={clsx(
            'absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-200',
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
                  'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3',
                  'hover:bg-gray-50',
                  value === option.value
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-gray-700'
                )}
                role="option"
                aria-selected={value === option.value}
              >
                {option.icon && (
                  <span className={value === option.value ? 'text-primary' : 'text-gray-500'}>
                    {option.icon}
                  </span>
                )}
                <span>{option.label}</span>
                {value === option.value && (
                  <svg
                    className="ml-auto w-4 h-4 text-primary"
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
