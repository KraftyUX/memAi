/**
 * StatsGrid component - Displays dashboard statistics
 * Requirements: 3.1, 3.2, 3.3, 3.4, 6.2, 6.3
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardStats } from '@/lib/types';

interface StatsGridProps {
  stats: DashboardStats;
}

/**
 * Displays a grid of statistics cards showing:
 * - Total memories count
 * - Total decisions count
 * - Active issues count
 * - Total implementations count
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    {
      id: 'total-memories',
      title: 'Total Memories',
      value: stats.totalMemories,
      description: 'All recorded memories',
      ariaLabel: `Total memories: ${stats.totalMemories}`,
    },
    {
      id: 'decisions',
      title: 'Decisions',
      value: stats.totalDecisions,
      description: 'Recorded decisions',
      ariaLabel: `Decisions: ${stats.totalDecisions}`,
    },
    {
      id: 'active-issues',
      title: 'Active Issues',
      value: stats.activeIssues,
      description: 'Unresolved issues',
      ariaLabel: `Active issues: ${stats.activeIssues}`,
    },
    {
      id: 'implementations',
      title: 'Implementations',
      value: stats.totalImplementations,
      description: 'Code implementations',
      ariaLabel: `Implementations: ${stats.totalImplementations}`,
    },
  ];

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Dashboard statistics"
    >
      {statItems.map((item) => (
        <Card
          key={item.id}
          tabIndex={0}
          aria-label={item.ariaLabel}
          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id={`${item.id}-title`} className="text-sm font-medium">
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              aria-labelledby={`${item.id}-title`}
            >
              {item.value}
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
