/**
 * Core data models for the memAI Dashboard
 * Requirements: 2.1, 3.1
 */

/**
 * Memory category types
 */
export type MemoryCategory =
  | 'checkpoint'
  | 'decision'
  | 'implementation'
  | 'issue'
  | 'validation'
  | 'insight';

/**
 * Memory interface representing a single memory entry
 */
export interface Memory {
  id: number;
  action: string;
  category: MemoryCategory;
  context?: string;
  reasoning?: string;
  outcome?: string;
  phase?: string;
  tags?: string;
  timestamp: string;
}

/**
 * View type for filtering memories by category
 */
export type ViewType = 'all' | 'decisions' | 'issues';

/**
 * Filter state for managing active filters
 */
export interface FilterState {
  search: string;
  category: string;
  view: ViewType;
}

/**
 * Dashboard statistics interface
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export interface DashboardStats {
  totalMemories: number;
  totalDecisions: number;
  activeIssues: number;
  totalImplementations: number;
}

/**
 * Decision interface representing a recorded decision
 */
export interface Decision {
  id: number;
  timestamp: number;
  decision: string;
  rationale: string;
  alternatives?: string;
  impact?: string;
  reversible: boolean;
  memory_id?: number;
}
