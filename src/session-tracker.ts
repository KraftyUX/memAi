/**
 * Session Tracker for memAI
 * Tracks agent session activity to detect memory recording lapses
 */

import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';

/**
 * Session state interface
 */
export interface SessionState {
  sessionId: string;
  startedAt: number;           // Unix timestamp (ms)
  toolCallCount: number;       // Total MCP tool invocations
  memoryCount: number;         // record_memory + record_decision calls
  lastRecordingAt: number | null;  // Timestamp of last memory recording
}

/**
 * Database row interface for sessions table
 */
interface SessionRow {
  id: string;
  started_at: number;
  tool_call_count: number;
  memory_count: number;
  last_recording_at: number | null;
  updated_at: number;
}

/**
 * Session age threshold for restoration (1 hour in ms)
 */
const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Health metrics for memory recording assessment
 */
export interface HealthMetrics {
  sessionDurationMs: number;
  toolCallCount: number;
  memoryCount: number;
  lastRecordingAt: number | null;
  timeSinceLastRecording: number | null;  // ms, null if never recorded
  memoryRatio: number;                     // memoryCount / toolCallCount
  status: 'healthy' | 'warning' | 'critical';
}

/**
 * Status thresholds configuration
 */
export interface StatusThresholds {
  healthyRecordingWindowMs: number;   // Default: 5 minutes
  warningRecordingWindowMs: number;   // Default: 10 minutes
  warningToolCallThreshold: number;   // Default: 5
  criticalToolCallThreshold: number;  // Default: 10
  healthyMemoryRatio: number;         // Default: 0.1
}

const DEFAULT_THRESHOLDS: StatusThresholds = {
  healthyRecordingWindowMs: 5 * 60 * 1000,   // 5 minutes
  warningRecordingWindowMs: 10 * 60 * 1000,  // 10 minutes
  warningToolCallThreshold: 5,
  criticalToolCallThreshold: 10,
  healthyMemoryRatio: 0.1,
};

/**
 * Creates a fresh session state
 */
export function createFreshState(): SessionState {
  return {
    sessionId: randomUUID(),
    startedAt: Date.now(),
    toolCallCount: 0,
    memoryCount: 0,
    lastRecordingAt: null,
  };
}


/**
 * SessionTracker class
 * Manages session state and activity metrics
 */
export class SessionTracker {
  private state: SessionState;
  private thresholds: StatusThresholds;
  private db: Database.Database | null = null;

  constructor(
    initialState?: Partial<SessionState>,
    thresholds?: Partial<StatusThresholds>,
    db?: Database.Database
  ) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.db = db ?? null;
    
    if (initialState) {
      // Merge with fresh state to ensure all fields are present
      const fresh = createFreshState();
      this.state = {
        sessionId: initialState.sessionId ?? fresh.sessionId,
        startedAt: initialState.startedAt ?? fresh.startedAt,
        toolCallCount: initialState.toolCallCount ?? 0,
        memoryCount: initialState.memoryCount ?? 0,
        lastRecordingAt: initialState.lastRecordingAt ?? null,
      };
    } else {
      this.state = createFreshState();
    }
  }

  /**
   * Set the database instance for persistence
   */
  setDatabase(db: Database.Database): void {
    this.db = db;
  }

  /**
   * Initialize a new session (resets all counters)
   */
  initialize(): SessionState {
    this.state = createFreshState();
    return this.state;
  }

  /**
   * Increment tool call counter (called on every MCP tool invocation)
   */
  incrementToolCall(): void {
    this.state.toolCallCount += 1;
  }

  /**
   * Record a memory (called on record_memory or record_decision)
   */
  recordMemory(): void {
    this.state.memoryCount += 1;
    this.state.lastRecordingAt = Date.now();
  }

  /**
   * Reset session state (called on finish_session)
   */
  reset(): void {
    this.state = createFreshState();
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Calculate and return health metrics
   */
  getHealthMetrics(): HealthMetrics {
    const now = Date.now();
    const sessionDurationMs = now - this.state.startedAt;
    const timeSinceLastRecording = this.state.lastRecordingAt 
      ? now - this.state.lastRecordingAt 
      : null;
    
    // Calculate memory ratio (0 if no tool calls)
    const memoryRatio = this.state.toolCallCount > 0 
      ? this.state.memoryCount / this.state.toolCallCount 
      : 0;

    // Determine status
    const status = this.calculateStatus(timeSinceLastRecording, memoryRatio);

    return {
      sessionDurationMs,
      toolCallCount: this.state.toolCallCount,
      memoryCount: this.state.memoryCount,
      lastRecordingAt: this.state.lastRecordingAt,
      timeSinceLastRecording,
      memoryRatio,
      status,
    };
  }

  /**
   * Calculate health status based on thresholds
   */
  private calculateStatus(
    timeSinceLastRecording: number | null,
    memoryRatio: number
  ): 'healthy' | 'warning' | 'critical' {
    const { 
      healthyRecordingWindowMs, 
      warningRecordingWindowMs,
      warningToolCallThreshold,
      criticalToolCallThreshold,
      healthyMemoryRatio 
    } = this.thresholds;

    // Critical: >10 min since recording OR >10 tool calls with 0 memories
    if (timeSinceLastRecording !== null && timeSinceLastRecording > warningRecordingWindowMs) {
      return 'critical';
    }
    if (this.state.memoryCount === 0 && this.state.toolCallCount > criticalToolCallThreshold) {
      return 'critical';
    }

    // Healthy: recorded within 5 min OR memoryRatio > 0.1
    if (timeSinceLastRecording !== null && timeSinceLastRecording <= healthyRecordingWindowMs) {
      return 'healthy';
    }
    if (memoryRatio > healthyMemoryRatio) {
      return 'healthy';
    }

    // Warning: 5-10 min since recording OR toolCalls > 5 with 0 memories
    if (timeSinceLastRecording !== null && 
        timeSinceLastRecording > healthyRecordingWindowMs && 
        timeSinceLastRecording <= warningRecordingWindowMs) {
      return 'warning';
    }
    if (this.state.memoryCount === 0 && this.state.toolCallCount > warningToolCallThreshold) {
      return 'warning';
    }

    // Default to healthy if no concerning conditions
    return 'healthy';
  }

  /**
   * Persist current session state to database
   * Called on every state update to ensure durability
   */
  persist(): void {
    if (!this.db) {
      // No database configured, skip persistence
      return;
    }

    try {
      const now = Date.now();
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO sessions (id, started_at, tool_call_count, memory_count, last_recording_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        this.state.sessionId,
        this.state.startedAt,
        this.state.toolCallCount,
        this.state.memoryCount,
        this.state.lastRecordingAt,
        now
      );
    } catch (err) {
      // Log warning but continue with in-memory state
      console.warn('Failed to persist session state:', err);
    }
  }

  /**
   * Restore most recent session state from database
   * Returns the restored state if found and less than 1 hour old, null otherwise
   */
  restore(): SessionState | null {
    if (!this.db) {
      // No database configured, cannot restore
      return null;
    }

    try {
      const now = Date.now();
      const cutoffTime = now - SESSION_MAX_AGE_MS;

      // Get most recent session that's not too old
      const stmt = this.db.prepare(`
        SELECT id, started_at, tool_call_count, memory_count, last_recording_at, updated_at
        FROM sessions
        WHERE updated_at > ?
        ORDER BY updated_at DESC
        LIMIT 1
      `);

      const row = stmt.get(cutoffTime) as SessionRow | undefined;

      if (row) {
        // Restore the session state
        this.state = {
          sessionId: row.id,
          startedAt: row.started_at,
          toolCallCount: row.tool_call_count,
          memoryCount: row.memory_count,
          lastRecordingAt: row.last_recording_at,
        };
        return this.getState();
      }

      // No valid session found, clean up old sessions
      this.cleanupOldSessions();
      return null;
    } catch (err) {
      // Log warning and return null
      console.warn('Failed to restore session state:', err);
      return null;
    }
  }

  /**
   * Clean up sessions older than 1 hour
   */
  private cleanupOldSessions(): void {
    if (!this.db) return;

    try {
      const cutoffTime = Date.now() - SESSION_MAX_AGE_MS;
      const stmt = this.db.prepare('DELETE FROM sessions WHERE updated_at <= ?');
      stmt.run(cutoffTime);
    } catch (err) {
      console.warn('Failed to cleanup old sessions:', err);
    }
  }
}
