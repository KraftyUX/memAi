/**
 * App component - Root component managing global state and layout
 * Requirements: 1.1, 2.1, 6.2, 6.3
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Moon, Sun, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  StatsGrid,
  FilterControls,
  ViewTabs,
  MemoryCard,
  Pagination,
  MemaiLogo,
  DashboardBreadcrumb,
} from '@/components';
import { useMemories } from '@/hooks/useMemories';
import { useFilters } from '@/hooks/useFilters';
import { useTheme } from '@/hooks/useTheme';
import { fetchStats } from '@/lib/api';
import type { DashboardStats, FilterState, ViewType } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

function App() {
  // Theme management (Requirements: 1.4)
  const { resolvedTheme, toggleMode } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Data fetching (Requirements: 2.1)
  const { memories, isLoading, error, refetch } = useMemories();

  // Filter state management (Requirements: 2.1, 2.2, 2.3, 2.4)
  const {
    filters,
    filteredMemories,
    setSearch,
    setCategory,
    setView,
  } = useFilters(memories);

  // Stats state (Requirements: 1.1, 1.2, 1.3, 1.4)
  const [stats, setStats] = useState<DashboardStats>({
    totalMemories: 0,
    totalDecisions: 0,
    activeIssues: 0,
    totalImplementations: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Pagination state (Requirements: 5.6)
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch stats on mount
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredMemories.length / ITEMS_PER_PAGE);
  const paginatedMemories = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMemories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMemories, currentPage]);

  // Filter change handler
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setSearch(newFilters.search);
      setCategory(newFilters.category);
    },
    [setSearch, setCategory]
  );

  // View change handler
  const handleViewChange = useCallback(
    (view: ViewType) => {
      setView(view);
    },
    [setView]
  );

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of memory list
    document.getElementById('memory-list')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await refetch();
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      // Stats refresh error is non-critical
    }
  }, [refetch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-5 max-w-7xl">
        {/* Header - Requirements: 4.1, 4.2, 4.3 */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-foreground">
            <MemaiLogo size={48} className="text-primary" />
            memAI
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="hover:bg-muted"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDark}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Breadcrumb Navigation - Requirements: 5.1 */}
        <DashboardBreadcrumb />

        {/* Stats Grid */}
        <section aria-label="Dashboard statistics" className="mb-8">
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-8 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : statsError ? (
            <Card className="border-destructive">
              <CardContent className="p-6 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <span role="alert">Failed to load statistics: {statsError}</span>
              </CardContent>
            </Card>
          ) : (
            <StatsGrid stats={stats} />
          )}
        </section>

        {/* Filter Controls */}
        <section aria-label="Filter controls" className="mb-6">
          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={handleRefresh}
          />
        </section>

        {/* View Tabs */}
        <section aria-label="View selection" className="mb-6">
          <ViewTabs activeView={filters.view} onViewChange={handleViewChange} />
        </section>

        {/* Memory List */}
        <main
          id="memory-list"
          role="region"
          aria-label="Memory list"
          aria-live="polite"
          aria-busy={isLoading}
          className="mb-8"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              <p className="text-muted-foreground">Loading memories...</p>
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                  <span role="alert">{error}</span>
                </div>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredMemories.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  {memories.length === 0
                    ? 'No memories recorded yet.'
                    : 'No memories match your current filters.'}
                </p>
                {memories.length > 0 && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setView('all');
                    }}
                    className="mt-2"
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label={`${filteredMemories.length} memories found`}
            >
              {paginatedMemories.map((memory) => (
                <div key={memory.id} role="listitem">
                  <MemoryCard memory={memory} />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Pagination */}
        {!isLoading && !error && filteredMemories.length > 0 && (
          <section aria-label="Pagination controls">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredMemories.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>memAI Dashboard &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
