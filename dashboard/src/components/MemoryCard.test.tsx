/**
 * Property-based tests for MemoryCard component
 * Uses fast-check for property-based testing
 * 
 * **Feature: dashboard-ux-elevation, Property 6: Memory card rendering completeness**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */

import { describe, it, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, cleanup, within } from '@testing-library/react';
import { MemoryCard } from './MemoryCard';
import type { Memory, MemoryCategory } from '@/lib/types';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Arbitrary for generating valid memory categories
const memoryCategory = fc.constantFrom<MemoryCategory>(
  'checkpoint',
  'decision',
  'implementation',
  'issue',
  'validation',
  'insight'
);

// Arbitrary for generating non-empty strings with visible characters
const nonEmptyString = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')),
  { minLength: 2, maxLength: 30 }
);

// Arbitrary for generating valid Memory objects
const memoryArbitrary: fc.Arbitrary<Memory> = fc.record({
  id: fc.nat(),
  action: nonEmptyString,
  category: memoryCategory,
  context: fc.option(nonEmptyString, { nil: undefined }),
  reasoning: fc.option(nonEmptyString, { nil: undefined }),
  outcome: fc.option(nonEmptyString, { nil: undefined }),
  phase: fc.option(fc.string(), { nil: undefined }),
  tags: fc.option(
    fc.array(nonEmptyString, { minLength: 1, maxLength: 3 })
      .map(tags => tags.join(', ')),
    { nil: undefined }
  ),
  timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
    .map((d) => d.toISOString()),
});

describe('MemoryCard - Property Tests', () => {
  /**
   * **Feature: dashboard-ux-elevation, Property 6: Memory card rendering completeness**
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
   * 
   * For any memory object, the rendered card output should contain:
   * - The action text (4.1)
   * - The category with appropriate styling (4.2)
   * - A formatted timestamp (4.3)
   * - For each present optional field (context, reasoning, outcome, tags), 
   *   the field should appear with its label (4.4, 4.5)
   */
  it('Property 6: Memory card rendering completeness', () => {
    fc.assert(
      fc.property(memoryArbitrary, (memory) => {
        // Clean up before each render to ensure isolation
        cleanup();
        
        const { container } = render(<MemoryCard memory={memory} />);
        const card = within(container);

        // 4.1: Action should be displayed as the card title
        const actionElements = card.queryAllByText(memory.action);
        const actionDisplayed = actionElements.length > 0;

        // 4.2: Category should be displayed with appropriate styling (as a badge)
        const categoryElements = card.queryAllByText(memory.category);
        const categoryDisplayed = categoryElements.length > 0;
        const categoryHasBadgeStyling = categoryElements.some(el => 
          el.classList.contains('inline-flex') ||
          el.getAttribute('aria-label')?.includes('Category')
        );

        // 4.3: Timestamp should be displayed in human-readable format
        const timeElement = container.querySelector('time');
        const timestampDisplayed = timeElement !== null && 
          timeElement.getAttribute('dateTime') === memory.timestamp;

        // 4.4: Optional fields should appear with labels when present
        let contextDisplayed = true;
        let reasoningDisplayed = true;
        let outcomeDisplayed = true;

        if (memory.context) {
          const contextLabels = card.queryAllByText('Context');
          const contextValues = card.queryAllByText(memory.context);
          contextDisplayed = contextLabels.length > 0 && contextValues.length > 0;
        }

        if (memory.reasoning) {
          const reasoningLabels = card.queryAllByText('Reasoning');
          const reasoningValues = card.queryAllByText(memory.reasoning);
          reasoningDisplayed = reasoningLabels.length > 0 && reasoningValues.length > 0;
        }

        if (memory.outcome) {
          const outcomeLabels = card.queryAllByText('Outcome');
          const outcomeValues = card.queryAllByText(memory.outcome);
          outcomeDisplayed = outcomeLabels.length > 0 && outcomeValues.length > 0;
        }

        // 4.5: Tags should be displayed as distinct visual elements when present
        let tagsDisplayed = true;
        if (memory.tags) {
          const tagsList = memory.tags.split(',').map(t => t.trim()).filter(Boolean);
          for (const tag of tagsList) {
            const tagElements = card.queryAllByText(tag);
            if (tagElements.length === 0) {
              tagsDisplayed = false;
              break;
            }
          }
        }

        return (
          actionDisplayed &&
          categoryDisplayed &&
          categoryHasBadgeStyling &&
          timestampDisplayed &&
          contextDisplayed &&
          reasoningDisplayed &&
          outcomeDisplayed &&
          tagsDisplayed
        );
      }),
      { numRuns: 100 }
    );
  });
});
