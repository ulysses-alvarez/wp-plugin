/**
 * ComboBox Component
 * Searchable select with dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface ComboBoxProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
}

export const ComboBox = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Buscar...',
  error,
  helperText,
  disabled = false,
  required = false,
  emptyMessage = 'No hay opciones disponibles'
}: ComboBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
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
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Display Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={clsx(
            'w-full px-4 py-2.5 text-left bg-white border rounded-lg shadow-sm transition-colors',
            'flex items-center justify-between gap-2',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-300',
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400 focus:outline-none focus:ring-1',
            isOpen && !error && 'border-gray-400'
          )}
        >
          <span className={clsx(
            'text-sm truncate',
            value ? 'text-gray-900' : 'text-gray-400'
          )}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-[320px] flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : emptyMessage}
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={clsx(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between gap-2',
                        value === option
                          ? 'bg-primary-light text-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <span className="truncate">{option}</span>
                      {value === option && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
