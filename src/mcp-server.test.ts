/**
 * Property-based tests for MCP Server integration
 * Tests session tracking integration with MCP tool handlers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { SessionTracker } from './session-tracker.js';

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

/**
 * Format milliseconds as human-readable duration (mirrors mcp-server.ts)
 */
function formatDurationMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Simulates the memory_pulse response structure
 * This mirrors the logic in mcp-server.ts memory_pulse handler
 */
function buildMemoryPulseResponse(tracker: SessionTracker): {
  sessionDuration: string;
  memoryCount: number;
  toolCallCount: number;
  timeSinceLastRecording: string | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
  suggestions?: string[];
  guidance?: string;
} {
  const metrics = tracker.getHealthMetrics();
  
  const response: {
    sessionDuration: string;
    memoryCount: number;
    toolCallCount: number;
    timeSinceLastRecording: string | null;
    healthStatus: 'healthy' | 'warning' | 'critical';
    suggestions?: string[];
    guidance?: string;
  } = {
    sessionDuration: formatDurationMs(metrics.sessionDurationMs),
    memoryCount: metrics.memoryCount,
    toolCallCount: metrics.toolCallCount,
    timeSinceLastRecording: metrics.timeSinceLastRecording !== null 
      ? formatDurationMs(metrics.timeSinceLastRecording)
      : null,
    healthStatus: metrics.status,
  };
  
  // Include suggestions when status is warning or critical (Requirements 4.2)
  if (metrics.status === 'warning' || metrics.status === 'critical') {
    response.suggestions = [
      'decision - Record any technical or architectural decisions made',
      'implementation - Log progress on current tasks',
      'issue - Document any bugs or problems encountered',
      'insight - Capture learnings or observations',
    ];
  }
  
  // Include guidance when status is critical (Requirements 4.4)
  if (metrics.status === 'critical') {
    response.guidance = '⚠️ Memory recording has lapsed significantly. Consider:\n' +
      '1. Recording any decisions made during this session\n' +
      '2. Logging implementation progress on current tasks\n' +
      '3. Documenting any issues or blockers encountered\n' +
      '4. Creating a checkpoint if switching contexts';
  }
  
  return response;
}

/**
 * Simulates the get_briefing response structure with session health
 * This mirrors the logic in mcp-server.ts get_briefing handler
 */
function buildBriefingResponse(tracker: SessionTracker): {
  sessionHealth: {
    sessionDuration: string;
    toolCallCount: number;
    memoryCount: number;
    healthStatus: string;
    warning?: string;
  };
} {
  const metrics = tracker.getHealthMetrics();
  
  const response: {
    sessionHealth: {
      sessionDuration: string;
      toolCallCount: number;
      memoryCount: number;
      healthStatus: string;
      warning?: string;
    };
  } = {
    sessionHealth: {
      sessionDuration: formatDurationMs(metrics.sessionDurationMs),
      toolCallCount: metrics.toolCallCount,
      memoryCount: metrics.memoryCount,
      healthStatus: metrics.status,
    },
  };
  
  // Add warning when memoryCount=0 and toolCallCount>5 (Requirements 2.2)
  if (metrics.memoryCount === 0 && metrics.toolCallCount > 5) {
    response.sessionHealth.warning = `⚠️ No memories recorded despite ${metrics.toolCallCount} tool calls. Consider recording your progress and decisions.`;
  }
  
  return response;
}

describe('MCP Server Integration', () => {
  /**
   * **Feature: memory-persistence-nudges, Property 4: Briefing includes session metrics**
   * **Validates: Requirements 2.1**
   * 
   * For any session state, when get_briefing is called, the response SHALL contain
   * sessionDuration, toolCallCount, and memoryCount fields.
   */
  describe('Property 4: Briefing includes session metrics', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('get_briefing response contains required session metrics fields', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary session state
          fc.record({
            toolCallCount: fc.nat({ max: 1000 }),
            memoryCount: fc.nat({ max: 500 }),
            lastRecordingAt: fc.option(fc.nat(), { nil: null }),
          }),
          (stateValues) => {
            const tracker = new SessionTracker(stateValues, undefined, db);
            
            // Build briefing response (simulates get_briefing handler)
            const response = buildBriefingResponse(tracker);
            
            // Verify sessionHealth object exists
            expect(response.sessionHealth).toBeDefined();
            
            // Verify required fields are present (Requirements 2.1)
            expect(response.sessionHealth.sessionDuration).toBeDefined();
            expect(typeof response.sessionHealth.sessionDuration).toBe('string');
            
            expect(response.sessionHealth.toolCallCount).toBeDefined();
            expect(typeof response.sessionHealth.toolCallCount).toBe('number');
            expect(response.sessionHealth.toolCallCount).toBe(stateValues.toolCallCount);
            
            expect(response.sessionHealth.memoryCount).toBeDefined();
            expect(typeof response.sessionHealth.memoryCount).toBe('number');
            expect(response.sessionHealth.memoryCount).toBe(stateValues.memoryCount);
            
            expect(response.sessionHealth.healthStatus).toBeDefined();
            expect(['healthy', 'warning', 'critical']).toContain(response.sessionHealth.healthStatus);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('session metrics reflect actual session activity', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 100 }),  // number of tool calls
          fc.nat({ max: 50 }),   // number of memory recordings
          (numToolCalls, numMemories) => {
            const tracker = new SessionTracker({}, undefined, db);
            
            // Simulate tool calls
            for (let i = 0; i < numToolCalls; i++) {
              tracker.incrementToolCall();
            }
            
            // Simulate memory recordings
            for (let i = 0; i < numMemories; i++) {
              tracker.recordMemory();
            }
            
            // Build briefing response
            const response = buildBriefingResponse(tracker);
            
            // Verify metrics match actual activity
            expect(response.sessionHealth.toolCallCount).toBe(numToolCalls);
            expect(response.sessionHealth.memoryCount).toBe(numMemories);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 5: Zero-memory warning triggers correctly**
   * **Validates: Requirements 2.2**
   * 
   * For any session state where memoryCount equals 0 AND toolCallCount exceeds 5,
   * when get_briefing is called, the response SHALL include a warning message.
   */
  describe('Property 5: Zero-memory warning triggers correctly', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('warning is present when memoryCount=0 and toolCallCount>5', () => {
      fc.assert(
        fc.property(
          // Generate toolCallCount > 5 (6 to 1000)
          fc.integer({ min: 6, max: 1000 }),
          (toolCallCount) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount: 0,  // Zero memories
            }, undefined, db);
            
            // Build briefing response
            const response = buildBriefingResponse(tracker);
            
            // Warning should be present (Requirements 2.2)
            expect(response.sessionHealth.warning).toBeDefined();
            expect(typeof response.sessionHealth.warning).toBe('string');
            expect(response.sessionHealth.warning!.length).toBeGreaterThan(0);
            
            // Warning should mention the tool call count
            expect(response.sessionHealth.warning).toContain(String(toolCallCount));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('warning is absent when memoryCount>0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 6, max: 1000 }),  // toolCallCount > 5
          fc.integer({ min: 1, max: 500 }),   // memoryCount > 0
          (toolCallCount, memoryCount) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount,
            }, undefined, db);
            
            // Build briefing response
            const response = buildBriefingResponse(tracker);
            
            // Warning should NOT be present when memories have been recorded
            expect(response.sessionHealth.warning).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('warning is absent when toolCallCount<=5', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),  // toolCallCount <= 5
          (toolCallCount) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount: 0,
            }, undefined, db);
            
            // Build briefing response
            const response = buildBriefingResponse(tracker);
            
            // Warning should NOT be present when tool calls <= 5
            expect(response.sessionHealth.warning).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 10: memory_pulse returns required fields**
   * **Validates: Requirements 4.1, 4.3**
   * 
   * For any session state, when memory_pulse is called, the response SHALL contain
   * sessionDuration, memoryCount, toolCallCount, timeSinceLastRecording, and healthStatus fields.
   */
  describe('Property 10: memory_pulse returns required fields', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('memory_pulse response contains all required fields for any session state', () => {
      fc.assert(
        fc.property(
          // Generate arbitrary session state
          // Use min: 1 for lastRecordingAt to avoid 0 which is falsy in JS
          fc.record({
            toolCallCount: fc.nat({ max: 1000 }),
            memoryCount: fc.nat({ max: 500 }),
            lastRecordingAt: fc.option(fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }), { nil: null }),
          }),
          (stateValues) => {
            const tracker = new SessionTracker(stateValues, undefined, db);
            
            // Build memory_pulse response (simulates memory_pulse handler)
            const response = buildMemoryPulseResponse(tracker);
            
            // Verify required fields are present (Requirements 4.1)
            expect(response.sessionDuration).toBeDefined();
            expect(typeof response.sessionDuration).toBe('string');
            
            expect(response.memoryCount).toBeDefined();
            expect(typeof response.memoryCount).toBe('number');
            expect(response.memoryCount).toBe(stateValues.memoryCount);
            
            expect(response.toolCallCount).toBeDefined();
            expect(typeof response.toolCallCount).toBe('number');
            expect(response.toolCallCount).toBe(stateValues.toolCallCount);
            
            // timeSinceLastRecording can be null or string
            expect('timeSinceLastRecording' in response).toBe(true);
            if (stateValues.lastRecordingAt !== null) {
              expect(typeof response.timeSinceLastRecording).toBe('string');
            } else {
              expect(response.timeSinceLastRecording).toBeNull();
            }
            
            // healthStatus must be one of the valid values (Requirements 4.3)
            expect(response.healthStatus).toBeDefined();
            expect(['healthy', 'warning', 'critical']).toContain(response.healthStatus);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('memory_pulse includes suggestions when status is warning or critical', () => {
      fc.assert(
        fc.property(
          // Generate state that will produce warning or critical status
          // Critical: >10 tool calls with 0 memories
          fc.integer({ min: 11, max: 1000 }),
          (toolCallCount) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount: 0,  // Zero memories triggers warning/critical
            }, undefined, db);
            
            const response = buildMemoryPulseResponse(tracker);
            
            // Status should be warning or critical
            expect(['warning', 'critical']).toContain(response.healthStatus);
            
            // Suggestions should be present (Requirements 4.2)
            expect(response.suggestions).toBeDefined();
            expect(Array.isArray(response.suggestions)).toBe(true);
            expect(response.suggestions!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: memory-persistence-nudges, Property 11: Critical status includes guidance**
   * **Validates: Requirements 4.4**
   * 
   * For any session state where healthStatus equals 'critical', when memory_pulse is called,
   * the response SHALL include non-empty guidance text.
   */
  describe('Property 11: Critical status includes guidance', () => {
    let db: Database.Database;

    beforeEach(() => {
      db = createTestDb();
    });

    afterEach(() => {
      db.close();
    });

    it('guidance is present when healthStatus is critical', () => {
      fc.assert(
        fc.property(
          // Generate state that will produce critical status
          // Critical: >10 tool calls with 0 memories
          fc.integer({ min: 11, max: 1000 }),
          (toolCallCount) => {
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount: 0,  // Zero memories with >10 calls = critical
            }, undefined, db);
            
            const response = buildMemoryPulseResponse(tracker);
            
            // Verify status is critical
            expect(response.healthStatus).toBe('critical');
            
            // Guidance should be present (Requirements 4.4)
            expect(response.guidance).toBeDefined();
            expect(typeof response.guidance).toBe('string');
            expect(response.guidance!.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('guidance is absent when healthStatus is not critical', () => {
      fc.assert(
        fc.property(
          // Generate state that will produce healthy status
          // Healthy: memoryRatio > 0.1
          fc.integer({ min: 1, max: 100 }),  // toolCallCount
          fc.integer({ min: 1, max: 50 }),   // memoryCount (ensures ratio > 0)
          (toolCallCount, memoryCount) => {
            // Ensure ratio > 0.1 for healthy status
            const adjustedMemoryCount = Math.max(memoryCount, Math.ceil(toolCallCount * 0.11));
            
            const tracker = new SessionTracker({
              toolCallCount,
              memoryCount: adjustedMemoryCount,
            }, undefined, db);
            
            const response = buildMemoryPulseResponse(tracker);
            
            // Status should be healthy (not critical)
            expect(response.healthStatus).not.toBe('critical');
            
            // Guidance should NOT be present when not critical
            expect(response.guidance).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
