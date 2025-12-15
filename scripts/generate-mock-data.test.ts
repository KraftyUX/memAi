/**
 * Property-based tests for Mock Data Generator
 * 
 * **Feature: dashboard-v2-enhancements, Property 2: Mock data field completeness**
 * **Validates: Requirements 2.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { mockMemories } from './generate-mock-data.js';

/**
 * **Feature: dashboard-v2-enhancements, Property 2: Mock data field completeness**
 * **Validates: Requirements 2.3**
 * 
 * For any generated mock memory, the action, context, reasoning, and outcome 
 * fields SHALL be non-empty strings.
 */
describe('Property 2: Mock data field completeness', () => {
  it('all mock memories have non-empty action, context, reasoning, and outcome fields', () => {
    fc.assert(
      fc.property(
        // Generate an index into the mockMemories array
        fc.integer({ min: 0, max: mockMemories.length - 1 }),
        (index) => {
          const memory = mockMemories[index];
          
          // action must be non-empty string
          expect(memory.action).toBeDefined();
          expect(typeof memory.action).toBe('string');
          expect(memory.action.trim().length).toBeGreaterThan(0);
          
          // context must be non-empty string
          expect(memory.context).toBeDefined();
          expect(typeof memory.context).toBe('string');
          expect(memory.context.trim().length).toBeGreaterThan(0);
          
          // reasoning must be non-empty string
          expect(memory.reasoning).toBeDefined();
          expect(typeof memory.reasoning).toBe('string');
          expect(memory.reasoning.trim().length).toBeGreaterThan(0);
          
          // outcome must be non-empty string
          expect(memory.outcome).toBeDefined();
          expect(typeof memory.outcome).toBe('string');
          expect(memory.outcome.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all mock memories have valid category', () => {
    const validCategories = [
      'checkpoint', 'decision', 'implementation', 'issue',
      'validation', 'insight', 'user-interaction'
    ];

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: mockMemories.length - 1 }),
        (index) => {
          const memory = mockMemories[index];
          expect(validCategories).toContain(memory.category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all mock memories have non-empty phase and tags', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: mockMemories.length - 1 }),
        (index) => {
          const memory = mockMemories[index];
          
          // phase must be non-empty string
          expect(memory.phase).toBeDefined();
          expect(typeof memory.phase).toBe('string');
          expect(memory.phase.trim().length).toBeGreaterThan(0);
          
          // tags must be non-empty string
          expect(memory.tags).toBeDefined();
          expect(typeof memory.tags).toBe('string');
          expect(memory.tags.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mock data contains exactly 33 entries', () => {
    expect(mockMemories.length).toBe(33);
  });

  it('mock data includes all 7 categories', () => {
    const categories = new Set(mockMemories.map(m => m.category));
    const expectedCategories = [
      'checkpoint', 'decision', 'implementation', 'issue',
      'validation', 'insight', 'user-interaction'
    ] as const;
    
    expectedCategories.forEach(cat => {
      expect(categories.has(cat)).toBe(true);
    });
  });

  it('mock data is distributed across multiple phases', () => {
    const phases = new Set(mockMemories.map(m => m.phase));
    // Should have at least 5 different phases
    expect(phases.size).toBeGreaterThanOrEqual(5);
  });
});
