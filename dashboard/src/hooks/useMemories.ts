/**
 * useMemories hook for fetching and caching memories data
 * Requirements: 2.1
 */

import { useState, useEffect, useCallback } from 'react';
import type { Memory, Decision } from '../lib/types';
import { fetchMemories, fetchDecisions, ApiError } from '../lib/api';

export interface UseMemoriesReturn {
  /** Array of memories */
  memories: Memory[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch memories from API */
  refetch: () => Promise<void>;
}

/**
 * Converts a Decision to a Memory format for unified display
 */
function decisionToMemory(decision: Decision): Memory {
  return {
    id: decision.id + 100000, // Offset to avoid ID collisions
    action: decision.decision,
    category: 'decision',
    context: decision.alternatives ? `Alternatives: ${decision.alternatives}` : undefined,
    reasoning: decision.rationale,
    outcome: decision.impact || undefined,
    timestamp: new Date(decision.timestamp).toISOString(),
  };
}

/**
 * Hook for fetching and managing memories data
 * 
 * @returns Object containing memories, loading state, error, and refetch function
 */
export function useMemories(): UseMemoriesReturn {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMemories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch memories first (required)
      const memoriesData = await fetchMemories();
      
      // Try to fetch decisions (optional - may not exist on older servers)
      let decisionsData: Decision[] = [];
      try {
        decisionsData = await fetchDecisions();
      } catch {
        // Decisions endpoint may not exist, continue without them
        console.warn('Decisions endpoint not available, showing memories only');
      }
      
      // Convert decisions to memory format and merge
      const decisionMemories = decisionsData.map(decisionToMemory);
      const allMemories = [...memoriesData, ...decisionMemories];
      
      // Sort by timestamp descending
      allMemories.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });
      
      setMemories(allMemories);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load memories: ${err.statusText}`);
      } else if (err instanceof Error) {
        setError(`Failed to load memories: ${err.message}`);
      } else {
        setError('Failed to load memories: Unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  return {
    memories,
    isLoading,
    error,
    refetch: loadMemories,
  };
}
