/**
 * Property-based tests for SessionTracker
 * Uses fast-check for property-based testing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SessionTracker, SessionState } from './session-tracker.js';

// Helper to create an in-memory database with schema
function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  return db;
}

describe('SessionTracker', () => {
  /**
   * **Feature: memory-persistence-nudges, Property 1: Session initialization produces clean state**
   * **Validates: Requirements 1.1, 1.4**
   * 
   * For any prior session state, when initialize() or reset() is called,
   * the resulting session tracker SHALL have toolCallCount=0, memoryCount=0,
   * and a fresh startedAt timestamp.
   */
  describe('Property 1: Session initialization produces clean state', () => {
    it('initialize() produces clean state regardless of prior state', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary prior session state
          fc.record({
            sessionId: fc.string(),
            startedAt: fc.nat(),
            toolCallCount: fc.nat({ max: 1000 }),
            memoryCount: fc.nat({ max: 1000 }),
            lastRecordingAt: fc.option(fc.nat(), { nil: null }),
          }),
          (priorState: SessionState) => {
            const tracker = new SessionTracker(priorState);
            const beforeInit = Date.now();
            const newState = tracker.initialize();
            const afterInit = Date.now();

            // Verify clean state
            expect(newState.toolCallCount).toBe(0);
            expect(newState.memoryCount).toBe(0);
            expect(newState.lastRecordingAt).toBeNull();
            
            // Verify fresh timestamp (within reasonable bounds)
            expect(newState.startedAt).toBeGreaterThanOrEqual(beforeInit);
            expect(newState.startedAt).toBeLessThanOrEqual(afterInit);
            
            // Verify new sessionId is generated
            expect(newState.sessionId).toBeDefined();
            expect(typeof newState.sessionId).toBe('string');
            expect(newState.sessionId.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('reset() produces clean state regardless of prior state', () => {
      fc.assert(
        fc.property(
          fc.record({
            sessionId: fc.string(),
            startedAt: fc.nat(),
            toolCallCount: fc.nat({ max: 1000 }),
            memoryCount: fc.nat({ max: 1000 }),
            lastRecordingAt: fc.option(fc.nat(), { nil: null }),
          }),
          (priorState: SessionState) => {
            const tracker = new SessionTracker(priorState);
            const beforeReset = Date.now();
            tracker.reset();
            const afterReset = Date.now();
            const newState = tracker.getState();

            // Verify clean state
            expect(newState.toolCallCount).toBe(0);
            expect(newState.memoryCount).toBe(0);
            expect(newState.lastRecordingAt).toBeNull();
            
            // Verify fresh timestamp
            expect(newState.startedAt).toBeGreaterThanOrEqual(beforeReset);
            expect(newState.startedAt).toBeLessThanOrEqual(afterReset);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * **Feature: memory-persistence-nudges, Property 2: Tool calls increment counter exactly once**
   * **Validates: Requirements 1.2**
   * 
   * For any session state and any MCP tool invocation,
   * the toolCallCount SHALL increase by exactly 1.
   */
  describe('Property 2: Tool calls increment counter exactly once', () => {
    it('incrementToolCall increases counter by exactly 1', () => {
      fc.assert(
        fc.property(
          // Generate initial tool call count
          fc.nat({ max: 10000 }),
          (initialToolCallCount: number) => {
            const tracker = new SessionTracker({
              toolCallCount: initialToolCallCount,
            });
            
            const before = tracker.getState().toolCallCount;
            tracker.incrementToolCall();
            const after = tracker.getState().toolCallCount;

            // Counter should increase by exactly 1
            expect(after).toBe(before + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple incrementToolCall calls each increment by exactly 1', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),  // initial count
          fc.nat({ max: 100 }),   // number of increments
          (initialCount: number, numIncrements: number) => {
            const tracker = new SessionTracker({
              toolCallCount: initialCount,
            });
            
            for (let i = 0; i < numIncrements; i++) {
              tracker.incrementToolCall();
            }
            
            const finalCount = tracker.getState().toolCallCount;
            expect(finalCount).toBe(initialCount + numIncrements);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 3: Memory recording updates both count and timestamp**
   * **Validates: Requirements 1.3**
   * 
   * For any session state, when recordMemory() is called,
   * the memoryCount SHALL increase by 1 AND lastRecordingAt SHALL be updated.
   */
  describe('Property 3: Memory recording updates both count and timestamp', () => {
    it('recordMemory increases count by 1 and updates timestamp', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 10000 }),  // initial memory count
          fc.option(fc.nat(), { nil: null }),  // initial lastRecordingAt
          (initialMemoryCount: number, initialLastRecordingAt: number | null) => {
            const tracker = new SessionTracker({
              memoryCount: initialMemoryCount,
              lastRecordingAt: initialLastRecordingAt,
            });
            
            const beforeRecord = Date.now();
            const countBefore = tracker.getState().memoryCount;
            
            tracker.recordMemory();
            
            const afterRecord = Date.now();
            const stateAfter = tracker.getState();

            // Memory count should increase by exactly 1
            expect(stateAfter.memoryCount).toBe(countBefore + 1);
            
            // lastRecordingAt should be updated to current time
            expect(stateAfter.lastRecordingAt).not.toBeNull();
            expect(stateAfter.lastRecordingAt).toBeGreaterThanOrEqual(beforeRecord);
            expect(stateAfter.lastRecordingAt).toBeLessThanOrEqual(afterRecord);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('multiple recordMemory calls each increment count and update timestamp', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1000 }),  // initial count
          fc.nat({ max: 50 }),    // number of recordings
          (initialCount: number, numRecordings: number) => {
            const tracker = new SessionTracker({
              memoryCount: initialCount,
            });
            
            for (let i = 0; i < numRecordings; i++) {
              const beforeRecord = Date.now();
              tracker.recordMemory();
              const afterRecord = Date.now();
              
              const state = tracker.getState();
              
              // Each recording should update timestamp
              if (numRecordings > 0) {
                expect(state.lastRecordingAt).toBeGreaterThanOrEqual(beforeRecord);
                expect(state.lastRecordingAt).toBeLessThanOrEqual(afterRecord);
              }
            }
            
            const finalCount = tracker.getState().memoryCount;
            expect(finalCount).toBe(initialCount + numRecordings);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 6: Memory ratio calculation is correct**
   * **Validates: Requirements 2.4**
   * 
   * For any session state with toolCallCount > 0, the computed memoryRatio
   * SHALL equal memoryCount divided by toolCallCount.
   */
  describe('Property 6: Memory ratio calculation is correct', () => {
    it('memoryRatio equals memoryCount / toolCallCount when toolCallCount > 0', () => {
      fc.assert(
        fc.property(
          // Generate toolCallCount > 0 to avoid division by zero
          fc.integer({ min: 1, max: 10000 }),
          fc.nat({ max: 10000 }),  // memoryCount can be any non-negative
          (toolCallCount: number, memoryCount: number) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount,
            });
            
            const metrics = tracker.getHealthMetrics();
            const expectedRatio = memoryCount / toolCallCount;
            
            // Memory ratio should equal memoryCount / toolCallCount
            expect(metrics.memoryRatio).toBe(expectedRatio);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('memoryRatio is 0 when toolCallCount is 0', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 10000 }),  // memoryCount can be any value
          (memoryCount: number) => {
            const tracker = new SessionTracker({
              toolCallCount: 0,
              memoryCount,
            });
            
            const metrics = tracker.getHealthMetrics();
            
            // Memory ratio should be 0 when no tool calls (avoid division by zero)
            expect(metrics.memoryRatio).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


  /**
   * **Feature: memory-persistence-nudges, Property 12: Session persistence stores all fields**
   * **Validates: Requirements 5.1, 5.4**
   * 
   * For any session state update, the persisted database record SHALL contain
   * sessionId, startedAt, toolCallCount, memoryCount, and lastRecordingAt.
   */
  describe('Property 12: Session persistence stores all fields', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('persist() stores all session fields in database', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary session state values
          fc.record({
            toolCallCount: fc.nat({ max: 10000 }),
            memoryCount: fc.nat({ max: 10000 }),
            lastRecordingAt: fc.option(fc.nat(), { nil: null }),
          }),
          (stateValues) => {
            const tracker = new SessionTracker(stateValues, undefined, db);
            
            // Persist the state
            tracker.persist();
            
            // Read back from database
            const state = tracker.getState();
            const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(state.sessionId) as {
              id: string;
              started_at: number;
              tool_call_count: number;
              memory_count: number;
              last_recording_at: number | null;
              updated_at: number;
            } | undefined;

            // Verify all fields are stored
            expect(row).toBeDefined();
            expect(row!.id).toBe(state.sessionId);
            expect(row!.started_at).toBe(state.startedAt);
            expect(row!.tool_call_count).toBe(state.toolCallCount);
            expect(row!.memory_count).toBe(state.memoryCount);
            expect(row!.last_recording_at).toBe(state.lastRecordingAt);
            expect(row!.updated_at).toBeDefined();
            expect(row!.updated_at).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('persist() updates existing session record', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100 }),  // number of tool calls to make
          fc.nat({ max: 50 }),   // number of memory recordings
          (numToolCalls, numMemories) => {
            const tracker = new SessionTracker({}, undefined, db);
            const sessionId = tracker.getState().sessionId;
            
            // Initial persist
            tracker.persist();
            
            // Make changes
            for (let i = 0; i < numToolCalls; i++) {
              tracker.incrementToolCall();
            }
            for (let i = 0; i < numMemories; i++) {
              tracker.recordMemory();
            }
            
            // Persist again
            tracker.persist();
            
            // Verify only one record exists with updated values
            const rows = db.prepare('SELECT * FROM sessions WHERE id = ?').all(sessionId);
            expect(rows.length).toBe(1);
            
            const row = rows[0] as {
              tool_call_count: number;
              memory_count: number;
            };
            expect(row.tool_call_count).toBe(numToolCalls);
            expect(row.memory_count).toBe(numMemories);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 13: Old sessions are discarded on restore**
   * **Validates: Requirements 5.3**
   * 
   * For any persisted session with updatedAt older than 1 hour,
   * when the MCP Server initializes, the session SHALL NOT be restored.
   */
  describe('Property 13: Old sessions are discarded on restore', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('restore() returns null for sessions older than 1 hour', () => {
      fc.assert(
        fc.property(
          // Generate age in ms that's definitely older than 1 hour (3600000ms)
          fc.integer({ min: 3600001, max: 86400000 }),  // 1 hour + 1ms to 24 hours
          fc.nat({ max: 1000 }),  // tool call count
          fc.nat({ max: 500 }),   // memory count
          fc.uuid(),  // unique session id
          (ageMs, toolCallCount, memoryCount, sessionId) => {
            const now = Date.now();
            const oldUpdatedAt = now - ageMs;
            const oldStartedAt = oldUpdatedAt - 60000;  // Started 1 min before update
            
            // Clear any existing sessions first
            db.prepare('DELETE FROM sessions').run();
            
            // Insert an old session directly into database
            db.prepare(`
              INSERT INTO sessions (id, started_at, tool_call_count, memory_count, last_recording_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(sessionId, oldStartedAt, toolCallCount, memoryCount, null, oldUpdatedAt);
            
            // Create new tracker and try to restore
            const tracker = new SessionTracker({}, undefined, db);
            const restored = tracker.restore();
            
            // Should not restore old session
            expect(restored).toBeNull();
            
            // Verify the tracker has a fresh state (not the old one)
            const state = tracker.getState();
            expect(state.sessionId).not.toBe(sessionId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('restore() returns session for sessions less than 1 hour old', () => {
      fc.assert(
        fc.property(
          // Generate age in ms that's less than 1 hour (3600000ms)
          // Use max of 3590000 (10 seconds buffer) to account for test execution time
          fc.integer({ min: 0, max: 3590000 }),  // 0 to ~59 min 50 sec
          fc.nat({ max: 1000 }),  // tool call count
          fc.nat({ max: 500 }),   // memory count
          fc.uuid(),  // unique session id
          (ageMs, toolCallCount, memoryCount, sessionId) => {
            const now = Date.now();
            const recentUpdatedAt = now - ageMs;
            const recentStartedAt = recentUpdatedAt - 60000;  // Started 1 min before update
            
            // Clear any existing sessions first
            db.prepare('DELETE FROM sessions').run();
            
            // Insert a recent session directly into database
            db.prepare(`
              INSERT INTO sessions (id, started_at, tool_call_count, memory_count, last_recording_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(sessionId, recentStartedAt, toolCallCount, memoryCount, null, recentUpdatedAt);
            
            // Create new tracker and try to restore
            const tracker = new SessionTracker({}, undefined, db);
            const restored = tracker.restore();
            
            // Should restore recent session
            expect(restored).not.toBeNull();
            expect(restored!.sessionId).toBe(sessionId);
            expect(restored!.toolCallCount).toBe(toolCallCount);
            expect(restored!.memoryCount).toBe(memoryCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
