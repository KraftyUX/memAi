/**
 * FilterControls component - Search and category filter UI
 * Requirements: 2.2, 2.3, 6.2, 6.3
 */

import { Search, Download, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterState } from '@/lib/types';
import { getExportUrl } from '@/lib/api';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onRefresh: () => void;
}

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Categories' },
  { value: 'checkpoint', label: 'Checkpoint' },
  { value: 'decision', label: 'Decision' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'issue', label: 'Issue' },
  { value: 'validation', label: 'Validation' },
  { value: 'insight', label: 'Insight' },
];

/**
 * Displays filter controls including:
 * - Search input for filtering by text
 * - Category dropdown for filtering by category
 * - Export button to download memories
 * - Refresh button to reload data
 */
export function FilterControls({
  filters,
  onFilterChange,
  onRefresh,
}: FilterControlsProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value });
  };

  const handleExport = () => {
    window.open(getExportUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      role="search"
      aria-label="Filter memories"
    >
      <div className="flex flex-1 gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search memories..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
            aria-label="Search memories by action, context, or outcome"
            aria-describedby="search-hint"
          />
          <span id="search-hint" className="sr-only">
            Type to filter memories by action, context, or outcome text
          </span>
        </div>
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger
            className="w-[180px]"
            aria-label="Filter by category"
            aria-describedby="category-hint"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value || 'all'} value={cat.value || 'all'}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span id="category-hint" className="sr-only">
          Select a category to filter memories
        </span>
      </div>
      <div className="flex gap-2" role="group" aria-label="Actions">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          aria-label="Export memories as markdown"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          aria-label="Refresh memories list"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
}
