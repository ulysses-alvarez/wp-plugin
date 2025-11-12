/**
 * Export Types
 * Types for CSV export functionality
 */

import type { Property } from '@/utils/permissions';

export interface ExportOptions {
  filters: {
    searchField: string;
    searchValue: string;
    sortBy: string;
    sortOrder: string;
  };
  columns: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  count: number;
  data: string; // CSV content
}

export interface CSVColumn {
  key: keyof Property | 'created_at';
  label: string;
}

