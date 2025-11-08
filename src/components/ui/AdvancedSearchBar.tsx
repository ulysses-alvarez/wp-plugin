/**
 * AdvancedSearchBar Component
 * Search bar with field context selector and dynamic input rendering
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { SEARCH_CONTEXTS, type SearchContext } from '@/utils/constants';

interface AdvancedSearchBarProps {
  onSearch: (field: string, value: string) => void;
  debounceMs?: number;
  className?: string;
}

export const AdvancedSearchBar = ({
  onSearch,
  debounceMs = 500,
  className
}: AdvancedSearchBarProps) => {
  const [selectedContext, setSelectedContext] = useState<SearchContext>(SEARCH_CONTEXTS[0]);
  const [searchValue, setSearchValue] = useState<string>('');
  const isFirstRender = useRef(true);

  // Debounced search effect
  useEffect(() => {
    // Skip the very first render to avoid calling onSearch on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // For selects, search immediately
    if (selectedContext.type === 'select') {
      onSearch(selectedContext.value, searchValue);
      return;
    }

    // For text/number, use debounce
    const timeoutId = setTimeout(() => {
      onSearch(selectedContext.value, searchValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, selectedContext.value, selectedContext.type, onSearch, debounceMs]);

  // Handle context change
  const handleContextChange = useCallback((newContextValue: string) => {
    const newContext = SEARCH_CONTEXTS.find(ctx => ctx.value === newContextValue);
    if (newContext) {
      setSelectedContext(newContext);
      setSearchValue(''); // Reset search value when context changes
    }
  }, []);

  // Handle input/select change
  const handleValueChange = useCallback((newValue: string) => {
    setSearchValue(newValue);
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setSearchValue('');
    setSelectedContext(SEARCH_CONTEXTS[0]);
  }, []);

  const hasValue = searchValue.length > 0;

  return (
    <div className={clsx('relative', className)}>
      <div className="flex items-stretch gap-0 border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
        {/* Context Selector */}
        <div className="relative">
          <select
            value={selectedContext.value}
            onChange={(e) => handleContextChange(e.target.value)}
            className="h-full px-3 py-2.5 text-sm bg-gray-50 border-r border-gray-300 text-gray-700 font-medium focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors"
            aria-label="Campo de búsqueda"
          >
            {SEARCH_CONTEXTS.map((context) => (
              <option key={context.value} value={context.value}>
                {context.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Input/Select based on context type */}
        <div className="flex-1 flex items-center relative">
          {/* Search Icon */}
          <svg
            className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Conditional Rendering based on field type */}
          {selectedContext.type === 'select' ? (
            // SELECT dropdown for enum fields (Status, State)
            <select
              value={searchValue}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm focus:outline-none"
              aria-label={selectedContext.label}
            >
              <option value="">Todos</option>
              {selectedContext.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : selectedContext.type === 'number' ? (
            // NUMBER input for numeric fields (Price, Postal Code)
            <input
              type="number"
              value={searchValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={selectedContext.placeholder}
              className="w-full pl-10 pr-10 py-2.5 text-sm focus:outline-none"
              aria-label={selectedContext.label}
            />
          ) : (
            // TEXT input for text fields (Title, Municipality, Street, General)
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={selectedContext.placeholder}
              className="w-full pl-10 pr-10 py-2.5 text-sm focus:outline-none"
              aria-label={selectedContext.label}
            />
          )}

          {/* Clear Button */}
          {hasValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpiar búsqueda"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Active Search Indicator */}
      {hasValue && (
        <div className="mt-2 text-xs text-gray-600">
          <span className="font-semibold text-primary">
            Buscando en {selectedContext.label}:
          </span>{' '}
          {selectedContext.type === 'select'
            ? selectedContext.options?.find(opt => opt.value === searchValue)?.label || searchValue
            : searchValue}
        </div>
      )}
    </div>
  );
};
