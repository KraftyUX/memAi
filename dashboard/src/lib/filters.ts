/**
 * Filter engine for memAI Dashboard
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import type { Memory, FilterState } from './types';

/**
 * Applies all active filters to a list of memories using AND logic.
 * 
 * @param memories - Array of memories to filter
 * @param filters - Current filter state
 * @returns Filtered array of memories matching all active filters
 */
export function applyFilters(memories: Memory[], filters: FilterState): Memory[] {
  return memories.filter((memory) => {
    const matchesSearch = matchSearchFilter(memory, filters.search);
    const matchesCategory = matchCategoryFilter(memory, filters.category);
    const matchesView = matchViewFilter(memory, filters.view);

    // AND logic: all active filters must match
    return matchesSearch && matchesCategory && matchesView;
  });
}

/**
 * Checks if a memory matches the search filter.
 * Searches in action, context, and outcome fields (case-insensitive).
 * 
 * @param memory - Memory to check
 * @param search - Search term
 * @returns true if search is empty or memory matches search term
 */
export function matchSearchFilter(memory: Memory, search: string): boolean {
  if (!search || search.trim() === '') {
    return true;
  }

  const searchLower = search.toLowerCase();
  
  const actionMatches = memory.action?.toLowerCase().includes(searchLower) ?? false;
  const contextMatches = memory.context?.toLowerCase().includes(searchLower) ?? false;
  const outcomeMatches = memory.outcome?.toLowerCase().includes(searchLower) ?? false;

  return actionMatches || contextMatches || outcomeMatches;
}

/**
 * Checks if a memory matches the category filter.
 * 
 * @param memory - Memory to check
 * @param category - Category filter value
 * @returns true if category is empty or memory category matches
 */
export function matchCategoryFilter(memory: Memory, category: string): boolean {
  if (!category || category === '') {
    return true;
  }

  return memory.category === category;
}

/**
 * Checks if a memory matches the view filter.
 * 
 * @param memory - Memory to check
 * @param view - View type filter
 * @returns true if view is 'all' or memory matches the view type
 */
export function matchViewFilter(memory: Memory, view: FilterState['view']): boolean {
  switch (view) {
    case 'all':
      return true;
    case 'decisions':
      return memory.category === 'decision';
    case 'issues':
      return memory.category === 'issue';
    default:
      return true;
  }
}

/**
 * Calculates statistics from a list of memories.
 * 
 * @param memories - Array of memories
 * @returns Dashboard statistics
 */
export function calculateStats(memories: Memory[]): {
  totalMemories: number;
  totalDecisions: number;
  activeIssues: number;
} {
  return {
    totalMemories: memories.length,
    totalDecisions: memories.filter((m) => m.category === 'decision').length,
    activeIssues: memories.filter((m) => m.category === 'issue').length,
  };
}
