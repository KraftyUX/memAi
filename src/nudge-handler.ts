/**
 * NudgeHandler for memAI
 * Determines when and what nudges to append to tool responses
 * to encourage memory recording when it has lapsed.
 */

import { SessionTracker, HealthMetrics } from './session-tracker.js';

/**
 * Configuration for nudge behavior
 */
export interface NudgeConfig {
  timeThresholdMs: number;      // Default: 10 minutes - nudge if no recording for this long
  activityThreshold: number;    // Default: 10 tool calls with 0 memories triggers nudge
  cooldownMs: number;           // Default: 5 minutes - suppress nudge if recorded recently
}

/**
 * Default nudge configuration
 */
const DEFAULT_NUDGE_CONFIG: NudgeConfig = {
  timeThresholdMs: 10 * 60 * 1000,   // 10 minutes
  activityThreshold: 10,              // 10 tool calls
  cooldownMs: 5 * 60 * 1000,          // 5 minutes
};

/**
 * Nudge message templates
 */
const NUDGE_TEMPLATES = {
  timeBasedWarning: "💡 Tip: You haven't recorded any memories in {duration}. Consider logging your recent progress.",
  activityBasedWarning: "💡 Tip: {toolCalls} tool calls with no memories recorded. What decisions or progress should be captured?",
  criticalGuidance: "⚠️ Memory recording lapsed. Suggested actions:\n- Record any decisions made\n- Log implementation progress\n- Note any issues encountered",
};

/**
 * Tool response interface for wrapping
 */
export interface ToolResponse {
  content: Array<{ type: string; text: string }>;
  [key: string]: unknown;
}

/**
 * Format milliseconds as human-readable duration
 */
function formatDuration(ms: number): string {
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
 * NudgeHandler class
 * Determines when and what nudges to append to responses
 */
export class NudgeHandler {
  private config: NudgeConfig;
  private tracker: SessionTracker;

  constructor(tracker: SessionTracker, config?: Partial<NudgeConfig>) {
    this.tracker = tracker;
    this.config = { ...DEFAULT_NUDGE_CONFIG, ...config };
  }

  /**
   * Check if a nudge should be appended to the response
   * Returns true if:
   * - Time since last recording exceeds threshold (10 min) AND not in cooldown
   * - OR activity threshold exceeded (10+ calls with 0 memories) AND not in cooldown
   */
  shouldNudge(): boolean {
    const metrics = this.tracker.getHealthMetrics();
    
    // Check cooldown: if recorded within cooldown period, suppress nudge
    if (this.isInCooldown(metrics)) {
      return false;
    }

    // Check time-based threshold: >10 min since last recording
    if (this.isTimeThresholdExceeded(metrics)) {
      return true;
    }

    // Check activity-based threshold: >10 tool calls with 0 memories
    if (this.isActivityThresholdExceeded(metrics)) {
      return true;
    }

    return false;
  }

  /**
   * Check if we're in cooldown period (recorded within last 5 minutes)
   */
  private isInCooldown(metrics: HealthMetrics): boolean {
    if (metrics.timeSinceLastRecording === null) {
      // Never recorded, not in cooldown
      return false;
    }
    return metrics.timeSinceLastRecording <= this.config.cooldownMs;
  }

  /**
   * Check if time threshold is exceeded (>10 min since last recording)
   */
  private isTimeThresholdExceeded(metrics: HealthMetrics): boolean {
    if (metrics.timeSinceLastRecording === null) {
      // Never recorded - check if session has been active long enough
      return metrics.sessionDurationMs > this.config.timeThresholdMs;
    }
    return metrics.timeSinceLastRecording > this.config.timeThresholdMs;
  }

  /**
   * Check if activity threshold is exceeded (>10 tool calls with 0 memories)
   */
  private isActivityThresholdExceeded(metrics: HealthMetrics): boolean {
    return metrics.memoryCount === 0 && metrics.toolCallCount > this.config.activityThreshold;
  }

  /**
   * Generate contextual nudge message based on current state
   */
  generateNudge(): string {
    const metrics = this.tracker.getHealthMetrics();

    // Critical status gets special guidance
    if (metrics.status === 'critical') {
      return NUDGE_TEMPLATES.criticalGuidance;
    }

    // Time-based nudge
    if (this.isTimeThresholdExceeded(metrics)) {
      const duration = metrics.timeSinceLastRecording !== null
        ? formatDuration(metrics.timeSinceLastRecording)
        : formatDuration(metrics.sessionDurationMs);
      return NUDGE_TEMPLATES.timeBasedWarning.replace('{duration}', duration);
    }

    // Activity-based nudge
    if (this.isActivityThresholdExceeded(metrics)) {
      return NUDGE_TEMPLATES.activityBasedWarning.replace('{toolCalls}', String(metrics.toolCallCount));
    }

    // Fallback (shouldn't reach here if shouldNudge() was true)
    return NUDGE_TEMPLATES.activityBasedWarning.replace('{toolCalls}', String(metrics.toolCallCount));
  }

  /**
   * Wrap a tool response with a nudge if conditions are met
   * Appends nudge to the end of the response text
   */
  wrapResponse(response: ToolResponse): ToolResponse {
    if (!this.shouldNudge()) {
      return response;
    }

    const nudge = this.generateNudge();
    
    // Clone the response to avoid mutating the original
    const wrappedResponse: ToolResponse = {
      ...response,
      content: response.content.map((item, index) => {
        // Append nudge to the last text content item
        if (item.type === 'text' && index === response.content.length - 1) {
          return {
            ...item,
            text: item.text + '\n\n---\n' + nudge,
          };
        }
        return { ...item };
      }),
    };

    // If no text content was found, add a new text item with the nudge
    if (!response.content.some(item => item.type === 'text')) {
      wrappedResponse.content = [
        ...response.content,
        { type: 'text', text: '\n---\n' + nudge },
      ];
    }

    return wrappedResponse;
  }

  /**
   * Get current nudge configuration
   */
  getConfig(): NudgeConfig {
    return { ...this.config };
  }

  /**
   * Update nudge configuration
   */
  setConfig(config: Partial<NudgeConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
