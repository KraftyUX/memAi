/**
 * MemoryCard component - Individual memory display
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2, 6.3
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Memory, MemoryCategory } from '@/lib/types';

interface MemoryCardProps {
  memory: Memory;
}

/**
 * Formats a timestamp string to a human-readable format
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

/**
 * Parses tags string into an array of individual tags
 */
function parseTags(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Displays a single memory entry with:
 * - Action as the card title
 * - Category badge with appropriate styling
 * - Timestamp in human-readable format
 * - Context, reasoning, outcome fields when present
 * - Tags as distinct badge elements
 */
export function MemoryCard({ memory }: MemoryCardProps) {
  const tags = parseTags(memory.tags);
  const cardId = `memory-${memory.id}`;

  return (
    <Card
      className="transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      tabIndex={0}
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${cardId}-content`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle
            id={`${cardId}-title`}
            className="text-base font-semibold leading-tight"
          >
            {memory.action}
          </CardTitle>
          <Badge
            variant={memory.category as MemoryCategory}
            aria-label={`Category: ${memory.category}`}
          >
            {memory.category}
          </Badge>
        </div>
        <time
          className="text-xs text-muted-foreground"
          dateTime={memory.timestamp}
          aria-label={`Created on ${formatTimestamp(memory.timestamp)}`}
        >
          {formatTimestamp(memory.timestamp)}
        </time>
      </CardHeader>
      <CardContent id={`${cardId}-content`} className="space-y-3">
        {memory.context && (
          <div>
            <span
              className="text-xs font-medium text-muted-foreground"
              id={`${cardId}-context-label`}
            >
              Context
            </span>
            <p className="text-sm" aria-labelledby={`${cardId}-context-label`}>
              {memory.context}
            </p>
          </div>
        )}
        {memory.reasoning && (
          <div>
            <span
              className="text-xs font-medium text-muted-foreground"
              id={`${cardId}-reasoning-label`}
            >
              Reasoning
            </span>
            <p className="text-sm" aria-labelledby={`${cardId}-reasoning-label`}>
              {memory.reasoning}
            </p>
          </div>
        )}
        {memory.outcome && (
          <div>
            <span
              className="text-xs font-medium text-muted-foreground"
              id={`${cardId}-outcome-label`}
            >
              Outcome
            </span>
            <p className="text-sm" aria-labelledby={`${cardId}-outcome-label`}>
              {memory.outcome}
            </p>
          </div>
        )}
        {tags.length > 0 && (
          <div
            className="flex flex-wrap gap-1 pt-2"
            role="list"
            aria-label="Tags"
          >
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index}`}
                variant="outline"
                className="text-xs"
                role="listitem"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
