/**
 * usePropertySelection Hook
 * Manages property selection state for bulk operations
 */

import { useState, useCallback, useEffect } from 'react';
import type { Property } from '@/utils/permissions';

export interface UsePropertySelectionReturn {
  // State
  selectedIds: Set<number>;
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;

  // Actions
  selectProperty: (id: number) => void;
  deselectProperty: (id: number) => void;
  toggleProperty: (id: number) => void;
  selectAll: (propertyIds: number[]) => void;
  deselectAll: () => void;
  clearSelections: () => void; // NEW: Clear all selections including sessionStorage
  isPropertySelected: (id: number) => boolean;

  // Utility
  getSelectedProperties: (properties: Property[]) => Property[];
}

/**
 * Hook to manage property selection for bulk operations
 * Uses sessionStorage to persist selections across page changes
 * Clears selections on page reload (F5/refresh)
 */
export const usePropertySelection = (): UsePropertySelectionReturn => {
  // Initialize from sessionStorage if available, but clear on page reload
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    // Detect if this is a page reload (F5/refresh)
    const isPageReload = (() => {
      try {
        // Modern API
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0) {
          return navEntries[0].type === 'reload';
        }
        // Fallback for older browsers
        return performance.navigation && performance.navigation.type === 1;
      } catch {
        return false;
      }
    })();

    // If page was reloaded, clear sessionStorage and start fresh
    if (isPageReload) {
      try {
        sessionStorage.removeItem('propertySelection');
      } catch (error) {
        console.error('Failed to clear selection from sessionStorage:', error);
      }
      return new Set();
    }

    // Otherwise, load from sessionStorage
    try {
      const stored = sessionStorage.getItem('propertySelection');
      if (stored) {
        const ids = JSON.parse(stored);
        return new Set(ids);
      }
    } catch (error) {
      console.error('Failed to load selection from sessionStorage:', error);
    }
    return new Set();
  });

  // Persist to sessionStorage whenever selection changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'propertySelection',
        JSON.stringify(Array.from(selectedIds))
      );
    } catch (error) {
      console.error('Failed to save selection to sessionStorage:', error);
    }
  }, [selectedIds]);

  /**
   * Select a single property
   */
  const selectProperty = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  /**
   * Deselect a single property
   */
  const deselectProperty = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Toggle a single property selection
   */
  const toggleProperty = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /**
   * Select all properties from the provided IDs
   */
  const selectAll = useCallback((propertyIds: number[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      propertyIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  /**
   * Clear all selections
   */
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Clear all selections including sessionStorage
   * Use this after bulk operations to fully reset
   */
  const clearSelections = useCallback(() => {
    setSelectedIds(new Set());
    try {
      sessionStorage.removeItem('propertySelection');
    } catch (error) {
      console.error('Failed to clear selection from sessionStorage:', error);
    }
  }, []);

  /**
   * Check if a property is selected
   */
  const isPropertySelected = useCallback(
    (id: number) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  /**
   * Get selected properties from a list
   */
  const getSelectedProperties = useCallback(
    (properties: Property[]) => {
      return properties.filter((property) => selectedIds.has(property.id));
    },
    [selectedIds]
  );

  // Derived state
  const selectedCount = selectedIds.size;
  const isAllSelected = false; // Will be determined by PropertyTable based on current page
  const isSomeSelected = selectedCount > 0;

  return {
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    selectProperty,
    deselectProperty,
    toggleProperty,
    selectAll,
    deselectAll,
    clearSelections,
    isPropertySelected,
    getSelectedProperties,
  };
};
