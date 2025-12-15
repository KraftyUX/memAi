/**
 * API client for memAI Dashboard
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import type { Memory, DashboardStats, Decision } from './types';

/**
 * API error class for handling fetch errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Briefing data structure returned by the API
 */
export interface BriefingData {
  summary: string;
  recentDecisions: Memory[];
  activeIssues: Memory[];
  progress: number;
}

/**
 * Base URL for API requests - defaults to current origin
 */
const API_BASE = '';

/**
 * Generic fetch wrapper with error handling and type safety
 */
async function fetchJson<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${endpoint}`,
      response.status,
      response.statusText
    );
  }
  
  return response.json() as Promise<T>;
}

/**
 * Fetches all memories from the API
 * Requirements: 2.1
 * 
 * @returns Promise resolving to array of Memory objects
 * @throws ApiError if the request fails
 */
export async function fetchMemories(): Promise<Memory[]> {
  return fetchJson<Memory[]>('/api/data');
}

/**
 * Fetches dashboard statistics from the API
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * 
 * @returns Promise resolving to DashboardStats object
 * @throws ApiError if the request fails
 */
export async function fetchStats(): Promise<DashboardStats> {
  return fetchJson<DashboardStats>('/api/stats');
}

/**
 * Fetches all decisions from the API
 * 
 * @returns Promise resolving to array of Decision objects
 * @throws ApiError if the request fails
 */
export async function fetchDecisions(): Promise<Decision[]> {
  return fetchJson<Decision[]>('/api/decisions');
}

/**
 * Fetches briefing data from the API
 * 
 * @returns Promise resolving to BriefingData object
 * @throws ApiError if the request fails
 */
export async function fetchBriefing(): Promise<BriefingData> {
  return fetchJson<BriefingData>('/api/briefing');
}

/**
 * Triggers export and returns the markdown content URL
 * 
 * @returns Promise resolving to the export download URL
 */
export function getExportUrl(): string {
  return `${API_BASE}/api/export`;
}
