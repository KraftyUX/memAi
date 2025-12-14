/**
 * Property-based tests for NudgeHandler
 * Uses fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { SessionTracker } from './session-tracker.js';
import { NudgeHandler, ToolResponse } from './nudge-handler.js';

/**
 * Helper to create a SessionTracker with specific state for testing
 */
function createTrackerWithState(state: {
  toolCallCount?: number;
  memoryCount?: number;
  lastRecordingAt?: number | null;
  startedAt?: number;
}): SessionTracker {
  const now = Date.now();
  return new SessionTracker({
    toolCallCount: state.toolCallCount ?? 0,
    memoryCount: state.memoryCount ?? 0,
    lastRecordingAt: state.lastRecordingAt ?? null,
    startedAt: state.startedAt ?? now,
  });
}

/**
 * Helper to create a mock tool response
 */
function createMockResponse(text: string): ToolResponse {
  return {
    content: [{ type: 'text', text }],
  };
}

describe('NudgeHandler', () => {
  /**
   * **Feature: memory-persistence-nudges, Property 7: Time-based nudge triggers after threshold**
   * **Validates: Requirements 3.1**
   *
   * For any session state where timeSinceLastRecording exceeds 10 minutes,
   * when a read-only tool is called, the response SHALL include a nudge.
   */
  describe('Property 7: Time-based nudge triggers after threshold', () => {
    it('shouldNudge returns true when timeSinceLastRecording exceeds 10 minutes', () => {
      const TEN_MINUTES_MS = 10 * 60 * 1000;
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      fc.assert(
        fc.property(
          // Generate time since last recording that exceeds 10 minutes but is within cooldown check
          // Must be > 10 min (600001ms+) to trigger time threshold
          fc.integer({ min: TEN_MINUTES_MS + 1, max: 24 * 60 * 60 * 1000 }),
          fc.nat({ max: 1000 }),  // toolCallCount (any value)
          fc.nat({ max: 1000 }),  // memoryCount (any value, but we'll set lastRecordingAt)
          (timeSinceLastRecording, toolCallCount, memoryCount) => {
            const now = Date.now();
            const lastRecordingAt = now - timeSinceLastRecording;
            
            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount,
              lastRecordingAt,
              startedAt: now - timeSinceLastRecording - 60000, // Started before last recording
            });

            const handler = new NudgeHandler(tracker);

            // Should nudge because time threshold exceeded
            expect(handler.shouldNudge()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('wrapResponse includes nudge when time threshold exceeded', () => {
      const TEN_MINUTES_MS = 10 * 60 * 1000;

      fc.assert(
        fc.property(
          fc.integer({ min: TEN_MINUTES_MS + 1, max: 24 * 60 * 60 * 1000 }),
          fc.string({ minLength: 1, maxLength: 100 }),  // original response text
          (timeSinceLastRecording, originalText) => {
            const now = Date.now();
            const lastRecordingAt = now - timeSinceLastRecording;

            const tracker = createTrackerWithState({
              lastRecordingAt,
              startedAt: now - timeSinceLastRecording - 60000,
            });

            const handler = new NudgeHandler(tracker);
            const response = createMockResponse(originalText);
            const wrapped = handler.wrapResponse(response);

            // Response should contain original text plus nudge (💡 for warning, ⚠️ for critical)
            const wrappedText = wrapped.content[0].text;
            expect(wrappedText).toContain(originalText);
            // Nudge indicator is either 💡 (warning) or ⚠️ (critical)
            const hasNudge = wrappedText.includes('💡') || wrappedText.includes('⚠️');
            expect(hasNudge).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('shouldNudge returns true for never-recorded sessions older than 10 minutes', () => {
      const TEN_MINUTES_MS = 10 * 60 * 1000;

      fc.assert(
        fc.property(
          // Session duration > 10 minutes
          fc.integer({ min: TEN_MINUTES_MS + 1, max: 24 * 60 * 60 * 1000 }),
          fc.nat({ max: 1000 }),  // toolCallCount
          (sessionDuration, toolCallCount) => {
            const now = Date.now();

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 0,
              lastRecordingAt: null,  // Never recorded
              startedAt: now - sessionDuration,
            });

            const handler = new NudgeHandler(tracker);

            // Should nudge because session is old and never recorded
            expect(handler.shouldNudge()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 8: Activity-based nudge triggers correctly**
   * **Validates: Requirements 3.2**
   *
   * For any session state where toolCallCount exceeds 10 AND memoryCount equals 0,
   * when a read-only tool is called, the response SHALL include a nudge.
   */
  describe('Property 8: Activity-based nudge triggers correctly', () => {
    it('shouldNudge returns true when toolCallCount > 10 and memoryCount = 0', () => {
      const ACTIVITY_THRESHOLD = 10;

      fc.assert(
        fc.property(
          // toolCallCount must exceed threshold (> 10)
          fc.integer({ min: ACTIVITY_THRESHOLD + 1, max: 10000 }),
          (toolCallCount) => {
            const now = Date.now();

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 0,  // Must be 0 for activity-based nudge
              lastRecordingAt: null,  // Never recorded
              startedAt: now - 60000,  // Started 1 minute ago (within time threshold)
            });

            const handler = new NudgeHandler(tracker);

            // Should nudge because activity threshold exceeded with 0 memories
            expect(handler.shouldNudge()).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('wrapResponse includes nudge when activity threshold exceeded', () => {
      const ACTIVITY_THRESHOLD = 10;

      fc.assert(
        fc.property(
          fc.integer({ min: ACTIVITY_THRESHOLD + 1, max: 10000 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (toolCallCount, originalText) => {
            const now = Date.now();

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 0,
              lastRecordingAt: null,
              startedAt: now - 60000,
            });

            const handler = new NudgeHandler(tracker);
            const response = createMockResponse(originalText);
            const wrapped = handler.wrapResponse(response);

            // Response should contain nudge (💡 for warning, ⚠️ for critical)
            const wrappedText = wrapped.content[0].text;
            expect(wrappedText).toContain(originalText);
            // Nudge indicator is either 💡 (warning) or ⚠️ (critical)
            const hasNudge = wrappedText.includes('💡') || wrappedText.includes('⚠️');
            expect(hasNudge).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('shouldNudge returns false when toolCallCount <= 10 even with 0 memories', () => {
      const ACTIVITY_THRESHOLD = 10;

      fc.assert(
        fc.property(
          // toolCallCount at or below threshold
          fc.integer({ min: 0, max: ACTIVITY_THRESHOLD }),
          (toolCallCount) => {
            const now = Date.now();

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 0,
              lastRecordingAt: null,
              startedAt: now - 60000,  // Recent session (within time threshold)
            });

            const handler = new NudgeHandler(tracker);

            // Should NOT nudge because activity threshold not exceeded
            expect(handler.shouldNudge()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('shouldNudge returns false when memoryCount > 0 even with high toolCallCount', () => {
      const ACTIVITY_THRESHOLD = 10;

      fc.assert(
        fc.property(
          fc.integer({ min: ACTIVITY_THRESHOLD + 1, max: 10000 }),
          fc.integer({ min: 1, max: 1000 }),  // memoryCount > 0
          (toolCallCount, memoryCount) => {
            const now = Date.now();

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount,
              lastRecordingAt: now - 60000,  // Recorded 1 minute ago (in cooldown)
              startedAt: now - 120000,
            });

            const handler = new NudgeHandler(tracker);

            // Should NOT nudge because memoryCount > 0 and in cooldown
            expect(handler.shouldNudge()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: memory-persistence-nudges, Property 9: Recent recording suppresses nudges**
   * **Validates: Requirements 3.4**
   *
   * For any session state where lastRecordingAt is within 5 minutes of current time,
   * when any read-only tool is called, the response SHALL NOT include a nudge.
   */
  describe('Property 9: Recent recording suppresses nudges', () => {
    it('shouldNudge returns false when lastRecordingAt is within 5 minutes', () => {
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      fc.assert(
        fc.property(
          // Time since last recording within cooldown (0 to 5 minutes)
          fc.integer({ min: 0, max: FIVE_MINUTES_MS }),
          fc.nat({ max: 10000 }),  // toolCallCount (any value, even high)
          fc.nat({ max: 1000 }),   // memoryCount (any value)
          (timeSinceLastRecording, toolCallCount, memoryCount) => {
            const now = Date.now();
            const lastRecordingAt = now - timeSinceLastRecording;

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount,
              lastRecordingAt,
              startedAt: now - 24 * 60 * 60 * 1000,  // Old session
            });

            const handler = new NudgeHandler(tracker);

            // Should NOT nudge because recorded recently (in cooldown)
            expect(handler.shouldNudge()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('wrapResponse does not modify response when in cooldown', () => {
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: FIVE_MINUTES_MS }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.nat({ max: 10000 }),
          (timeSinceLastRecording, originalText, toolCallCount) => {
            const now = Date.now();
            const lastRecordingAt = now - timeSinceLastRecording;

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 1,  // At least one memory recorded
              lastRecordingAt,
              startedAt: now - 24 * 60 * 60 * 1000,
            });

            const handler = new NudgeHandler(tracker);
            const response = createMockResponse(originalText);
            const wrapped = handler.wrapResponse(response);

            // Response should NOT be modified (no nudge)
            expect(wrapped.content[0].text).toBe(originalText);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('cooldown suppresses nudge even when other thresholds are exceeded', () => {
      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      const ACTIVITY_THRESHOLD = 10;

      fc.assert(
        fc.property(
          // Recent recording (in cooldown)
          fc.integer({ min: 0, max: FIVE_MINUTES_MS }),
          // High tool call count that would normally trigger nudge
          fc.integer({ min: ACTIVITY_THRESHOLD + 1, max: 10000 }),
          (timeSinceLastRecording, toolCallCount) => {
            const now = Date.now();
            const lastRecordingAt = now - timeSinceLastRecording;

            const tracker = createTrackerWithState({
              toolCallCount,
              memoryCount: 1,  // Has recorded at least once
              lastRecordingAt,
              startedAt: now - 24 * 60 * 60 * 1000,  // Old session
            });

            const handler = new NudgeHandler(tracker);

            // Should NOT nudge because in cooldown, despite high activity
            expect(handler.shouldNudge()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional unit tests for NudgeHandler functionality
   */
  describe('NudgeHandler utility functions', () => {
    it('generateNudge returns appropriate message for time-based trigger', () => {
      const now = Date.now();
      // Use 8 minutes - within warning range but not critical (>10 min)
      const tracker = createTrackerWithState({
        lastRecordingAt: now - 8 * 60 * 1000,  // 8 minutes ago (warning, not critical)
        toolCallCount: 5,  // Below critical threshold
        memoryCount: 1,
        startedAt: now - 20 * 60 * 1000,
      });

      const handler = new NudgeHandler(tracker, { timeThresholdMs: 5 * 60 * 1000 });  // 5 min threshold
      const nudge = handler.generateNudge();

      expect(nudge).toContain('💡');
      expect(nudge).toContain('minute');
    });

    it('generateNudge returns appropriate message for activity-based trigger', () => {
      const now = Date.now();
      // Use exactly 11 tool calls - above activity threshold but below critical
      // And a recent session so time threshold isn't exceeded
      const tracker = createTrackerWithState({
        toolCallCount: 11,  // Just above threshold (10)
        memoryCount: 0,
        lastRecordingAt: null,
        startedAt: now - 60000,  // Recent session (1 minute)
      });

      const handler = new NudgeHandler(tracker);
      const nudge = handler.generateNudge();

      // With 11 tool calls and 0 memories, status is 'critical' (>10 calls with 0 memories)
      // So we get the critical guidance message
      expect(nudge).toContain('⚠️');
      expect(nudge).toContain('Memory recording lapsed');
    });

    it('generateNudge returns critical guidance for critical status', () => {
      const now = Date.now();
      const tracker = createTrackerWithState({
        toolCallCount: 15,
        memoryCount: 0,
        lastRecordingAt: now - 15 * 60 * 1000,  // 15 minutes ago (critical)
        startedAt: now - 20 * 60 * 1000,
      });

      const handler = new NudgeHandler(tracker);
      const nudge = handler.generateNudge();

      expect(nudge).toContain('⚠️');
      expect(nudge).toContain('Memory recording lapsed');
    });

    it('getConfig returns current configuration', () => {
      const tracker = createTrackerWithState({});
      const handler = new NudgeHandler(tracker);
      const config = handler.getConfig();

      expect(config.timeThresholdMs).toBe(10 * 60 * 1000);
      expect(config.activityThreshold).toBe(10);
      expect(config.cooldownMs).toBe(5 * 60 * 1000);
    });

    it('setConfig updates configuration', () => {
      const tracker = createTrackerWithState({});
      const handler = new NudgeHandler(tracker);
      
      handler.setConfig({ timeThresholdMs: 5 * 60 * 1000 });
      const config = handler.getConfig();

      expect(config.timeThresholdMs).toBe(5 * 60 * 1000);
      expect(config.activityThreshold).toBe(10);  // Unchanged
    });
  });
});
