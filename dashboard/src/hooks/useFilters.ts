/**
 * useFilters hook for managing filter state and applying filters to memories
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { useState, useMemo, useCallback } from 'react';
import type { Memory, FilterState, ViewType } from '../lib/types';
import { applyFilters } from '../lib/filters';

export interface UseFiltersReturn {
  /** Current filter state */
  filters: FilterState;
  /** Filtered memories based on current filter state */
  filteredMemories: Memory[];
  /** Set search filter value */
  setSearch: (search: string) => void;
  /** Set category filter value */
  setCategory: (category: string) => void;
  /** Set view type filter */
  setView: (view: ViewType) => void;
  /** Reset all filters to default values */
  resetFilters: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: '',
  view: 'all',
};

/**
 * Hook for managing filter state and applying filters to memories
 * 
 * @param memories - Array of memories to filter
 * @returns Object containing filter state, filtered memories, and filter setters
 */
export function useFilters(memories: Memory[]): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Apply filters using AND logic (Requirements: 2.4)
  const filteredMemories = useMemo(
    () => applyFilters(memories, filters),
    [memories, filters]
  );

  // Filter setters
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setView = useCallback((view: ViewType) => {
    setFilters((prev) => ({ ...prev, view }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    filteredMemories,
    setSearch,
    setCategory,
    setView,
    resetFilters,
  };
}
