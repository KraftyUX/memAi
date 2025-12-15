/**
 * Property-based tests for StatsGrid component
 * Uses fast-check for property-based testing
 * 
 * **Feature: dashboard-v2-enhancements, Property 1: Statistics accuracy**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { StatsGrid } from './StatsGrid';
import type { DashboardStats } from '@/lib/types';

// Arbitrary for generating valid DashboardStats objects
const dashboardStatsArbitrary: fc.Arbitrary<DashboardStats> = fc.record({
  totalMemories: fc.nat({ max: 10000 }),
  totalDecisions: fc.nat({ max: 10000 }),
  activeIssues: fc.nat({ max: 1000 }),
  totalImplementations: fc.nat({ max: 10000 }),
});

describe('StatsGrid - Property Tests', () => {
  /**
   * **Feature: dashboard-v2-enhancements, Property 1: Statistics accuracy**
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
   * 
   * For any set of stats values, the StatsGrid component SHALL display values
   * that exactly match the stats passed to it.
   */
  it('Property 1: Statistics accuracy - displayed values match input stats', () => {
    fc.assert(
      fc.property(dashboardStatsArbitrary, (stats) => {
        const { unmount } = render(<StatsGrid stats={stats} />);

        // Requirement 1.1: Total memories count is displayed correctly
        const totalMemoriesCard = screen.getByLabelText(`Total memories: ${stats.totalMemories}`);
        expect(totalMemoriesCard).toBeInTheDocument();
        expect(totalMemoriesCard).toHaveTextContent(String(stats.totalMemories));

        // Requirement 1.2: Total decisions count is displayed correctly
        const decisionsCard = screen.getByLabelText(`Decisions: ${stats.totalDecisions}`);
        expect(decisionsCard).toBeInTheDocument();
        expect(decisionsCard).toHaveTextContent(String(stats.totalDecisions));

        // Requirement 1.3: Active issues count is displayed correctly
        const issuesCard = screen.getByLabelText(`Active issues: ${stats.activeIssues}`);
        expect(issuesCard).toBeInTheDocument();
        expect(issuesCard).toHaveTextContent(String(stats.activeIssues));

        // Requirement 1.4: Implementations count is displayed correctly
        const implementationsCard = screen.getByLabelText(`Implementations: ${stats.totalImplementations}`);
        expect(implementationsCard).toBeInTheDocument();
        expect(implementationsCard).toHaveTextContent(String(stats.totalImplementations));

        // Cleanup for next iteration
        unmount();

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1a: All stat cards are rendered
   * Validates that all 4 stat cards are always present in the grid.
   */
  it('Property 1a: All stat cards are rendered', () => {
    fc.assert(
      fc.property(dashboardStatsArbitrary, (stats) => {
        const { unmount } = render(<StatsGrid stats={stats} />);

        // Stats region should be present
        const statsRegion = screen.getByRole('region', { name: 'Dashboard statistics' });
        expect(statsRegion).toBeInTheDocument();

        // Check all titles are present
        expect(screen.getByText('Total Memories')).toBeInTheDocument();
        expect(screen.getByText('Decisions')).toBeInTheDocument();
        expect(screen.getByText('Active Issues')).toBeInTheDocument();
        expect(screen.getByText('Implementations')).toBeInTheDocument();

        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
