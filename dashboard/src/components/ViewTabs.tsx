/**
 * ViewTabs component - Tab navigation for view switching
 * Requirements: 2.1
 */

import { Button } from '@/components/ui/button';
import type { ViewType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ViewTabsProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TABS: Array<{ value: ViewType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'decisions', label: 'Decisions' },
  { value: 'issues', label: 'Issues' },
];

/**
 * Displays tab buttons for switching between views:
 * - All: Shows all memories
 * - Decisions: Shows only decision-type memories
 * - Issues: Shows only issue-type memories
 */
export function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
  return (
    <div
      className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
      role="tablist"
      aria-label="Memory view tabs"
    >
      {TABS.map((tab) => (
        <Button
          key={tab.value}
          variant="ghost"
          size="sm"
          role="tab"
          aria-selected={activeView === tab.value}
          aria-controls={`${tab.value}-panel`}
          className={cn(
            'rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
            activeView === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'hover:bg-background/50 hover:text-foreground'
          )}
          onClick={() => onViewChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
