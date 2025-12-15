/**
 * Property-based tests for filter logic
 * Uses fast-check for property-based testing
 */

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { applyFilters, matchCategoryFilter, calculateStats } from './filters';
import type { Memory, MemoryCategory, FilterState } from './types';

// Arbitrary for generating valid memory categories
const memoryCategory = fc.constantFrom<MemoryCategory>(
  'checkpoint',
  'decision',
  'implementation',
  'issue',
  'validation',
  'insight'
);

// Arbitrary for generating valid Memory objects
const memoryArbitrary: fc.Arbitrary<Memory> = fc.record({
  id: fc.nat(),
  action: fc.string({ minLength: 1 }),
  category: memoryCategory,
  context: fc.option(fc.string(), { nil: undefined }),
  reasoning: fc.option(fc.string(), { nil: undefined }),
  outcome: fc.option(fc.string(), { nil: undefined }),
  phase: fc.option(fc.string(), { nil: undefined }),
  tags: fc.option(fc.string(), { nil: undefined }),
  timestamp: fc.date().map((d) => d.toISOString()),
});

// Arbitrary for generating arrays of memories
const memoriesArbitrary = fc.array(memoryArbitrary, { minLength: 0, maxLength: 50 });

describe('Filter Engine - Property Tests', () => {
  /**
   * **Feature: dashboard-ux-elevation, Property 1: Category filtering returns only matching memories**
   * **Validates: Requirements 2.1, 2.2**
   * 
   * For any set of memories and any category filter value, all memories in the 
   * filtered result should have a category equal to the filter value.
   */
  it('Property 1: Category filtering returns only matching memories', () => {
    fc.assert(
      fc.property(
        memoriesArbitrary,
        memoryCategory,
        (memories, categoryFilter) => {
          const filters: FilterState = {
            search: '',
            category: categoryFilter,
            view: 'all',
          };

          const result = applyFilters(memories, filters);

          // All memories in the result should have the filtered category
          const allMatchCategory = result.every(
            (memory) => memory.category === categoryFilter
          );

          return allMatchCategory;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Empty category filter returns all memories
   * This validates that when no category is selected, all memories pass through.
   */
  it('Property 1a: Empty category filter returns all memories', () => {
    fc.assert(
      fc.property(memoriesArbitrary, (memories) => {
        const filters: FilterState = {
          search: '',
          category: '',
          view: 'all',
        };

        const result = applyFilters(memories, filters);

        // With no category filter, all memories should be returned
        return result.length === memories.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: matchCategoryFilter unit behavior
   * Validates the individual filter function works correctly.
   */
  it('matchCategoryFilter returns true for matching category', () => {
    fc.assert(
      fc.property(memoryArbitrary, (memory) => {
        // When filtering by the memory's own category, it should match
        return matchCategoryFilter(memory, memory.category) === true;
      }),
      { numRuns: 100 }
    );
  });

  it('matchCategoryFilter returns true for empty category filter', () => {
    fc.assert(
      fc.property(memoryArbitrary, (memory) => {
        // Empty category filter should match all memories
        return matchCategoryFilter(memory, '') === true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dashboard-ux-elevation, Property 2: Search filtering returns only matching memories**
   * **Validates: Requirements 2.3**
   * 
   * For any set of memories and any non-empty search term, all memories in the 
   * filtered result should contain the search term in at least one of: action, 
   * context, or outcome fields.
   */
  it('Property 2: Search filtering returns only matching memories', () => {
    // Use a non-whitespace string to avoid edge case where trim() makes it empty
    const nonWhitespaceString = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
    
    fc.assert(
      fc.property(
        memoriesArbitrary,
        nonWhitespaceString,
        (memories, searchTerm) => {
          const filters: FilterState = {
            search: searchTerm,
            category: '',
            view: 'all',
          };

          const result = applyFilters(memories, filters);
          const searchLower = searchTerm.toLowerCase();

          // All memories in the result should contain the search term
          // in at least one of: action, context, or outcome
          const allMatchSearch = result.every((memory) => {
            const actionMatches = memory.action?.toLowerCase().includes(searchLower) ?? false;
            const contextMatches = memory.context?.toLowerCase().includes(searchLower) ?? false;
            const outcomeMatches = memory.outcome?.toLowerCase().includes(searchLower) ?? false;
            return actionMatches || contextMatches || outcomeMatches;
          });

          return allMatchSearch;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Empty search filter returns all memories
   * This validates that when no search term is provided, all memories pass through.
   */
  it('Property 2a: Empty search filter returns all memories', () => {
    fc.assert(
      fc.property(memoriesArbitrary, (memories) => {
        const filters: FilterState = {
          search: '',
          category: '',
          view: 'all',
        };

        const result = applyFilters(memories, filters);

        // With no search filter, all memories should be returned
        return result.length === memories.length;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dashboard-ux-elevation, Property 3: Combined filters apply AND logic**
   * **Validates: Requirements 2.4**
   *
   * For any set of memories and any combination of active filters (search, category, view),
   * all memories in the filtered result should satisfy every active filter condition simultaneously.
   */
  it('Property 3: Combined filters apply AND logic', () => {
    // Arbitrary for view types
    const viewType = fc.constantFrom<FilterState['view']>('all', 'decisions', 'issues');

    fc.assert(
      fc.property(
        memoriesArbitrary,
        fc.string(),
        fc.oneof(fc.constant(''), memoryCategory),
        viewType,
        (memories, searchTerm, categoryFilter, viewFilter) => {
          const filters: FilterState = {
            search: searchTerm,
            category: categoryFilter,
            view: viewFilter,
          };

          const result = applyFilters(memories, filters);
          const searchLower = searchTerm.toLowerCase();

          // Every memory in the result must satisfy ALL active filters
          const allSatisfyAllFilters = result.every((memory) => {
            // Check search filter (if active)
            const matchesSearch =
              !searchTerm ||
              searchTerm.trim() === '' ||
              (memory.action?.toLowerCase().includes(searchLower) ?? false) ||
              (memory.context?.toLowerCase().includes(searchLower) ?? false) ||
              (memory.outcome?.toLowerCase().includes(searchLower) ?? false);

            // Check category filter (if active)
            const matchesCategory =
              !categoryFilter || categoryFilter === '' || memory.category === categoryFilter;

            // Check view filter
            const matchesView =
              viewFilter === 'all' ||
              (viewFilter === 'decisions' && memory.category === 'decision') ||
              (viewFilter === 'issues' && memory.category === 'issue');

            return matchesSearch && matchesCategory && matchesView;
          });

          return allSatisfyAllFilters;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dashboard-ux-elevation, Property 4: Filter count matches actual results**
   * **Validates: Requirements 2.5**
   *
   * For any filter state and dataset, the count displayed should equal the length
   * of the filtered result array.
   */
  it('Property 4: Filter count matches actual results', () => {
    const viewType = fc.constantFrom<FilterState['view']>('all', 'decisions', 'issues');

    fc.assert(
      fc.property(
        memoriesArbitrary,
        fc.string(),
        fc.oneof(fc.constant(''), memoryCategory),
        viewType,
        (memories, searchTerm, categoryFilter, viewFilter) => {
          const filters: FilterState = {
            search: searchTerm,
            category: categoryFilter,
            view: viewFilter,
          };

          // Apply filters to get the filtered result
          const filteredResult = applyFilters(memories, filters);

          // Calculate stats from the filtered result
          const stats = calculateStats(filteredResult);

          // The total count should equal the filtered result length
          const totalCountMatches = stats.totalMemories === filteredResult.length;

          // The decisions count should equal the number of decision memories in filtered result
          const decisionsInFiltered = filteredResult.filter((m) => m.category === 'decision').length;
          const decisionsCountMatches = stats.totalDecisions === decisionsInFiltered;

          // The issues count should equal the number of issue memories in filtered result
          const issuesInFiltered = filteredResult.filter((m) => m.category === 'issue').length;
          const issuesCountMatches = stats.activeIssues === issuesInFiltered;

          return totalCountMatches && decisionsCountMatches && issuesCountMatches;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: dashboard-ux-elevation, Property 5: Statistics accuracy**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   *
   * For any dataset, the total memories stat should equal the dataset length,
   * the decisions stat should equal the count of memories with category="decision",
   * and the issues stat should equal the count of memories with category="issue".
   */
  it('Property 5: Statistics accuracy', () => {
    fc.assert(
      fc.property(memoriesArbitrary, (memories) => {
        // Calculate stats from the dataset
        const stats = calculateStats(memories);

        // Property 5.1: Total memories stat equals dataset length (Req 3.1)
        const totalCountAccurate = stats.totalMemories === memories.length;

        // Property 5.2: Decisions stat equals count of decision memories (Req 3.2)
        const expectedDecisions = memories.filter((m) => m.category === 'decision').length;
        const decisionsCountAccurate = stats.totalDecisions === expectedDecisions;

        // Property 5.3: Issues stat equals count of issue memories (Req 3.3)
        const expectedIssues = memories.filter((m) => m.category === 'issue').length;
        const issuesCountAccurate = stats.activeIssues === expectedIssues;

        return totalCountAccurate && decisionsCountAccurate && issuesCountAccurate;
      }),
      { numRuns: 100 }
    );
  });
});
