/**
 * Export Service
 * Handles CSV export functionality
 */

import type { Property } from '@/utils/permissions';
import type { CSVColumn } from '@/types/export';
import { propertiesToCSV, generateCSVFilename } from '@/utils/csvFormatter';

/**
 * Download CSV file to user's computer
 */
export const downloadCSV = (data: string, filename: string): void => {
  // Crear blob con UTF-8 BOM para compatibilidad con Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + data], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export properties to CSV
 */
export const exportPropertiesToCSV = (
  properties: Property[],
  columns: CSVColumn[],
  filters: { searchField: string; searchValue: string }
): void => {
  if (properties.length === 0) {
    throw new Error('No hay propiedades para exportar');
  }

  // Generate CSV content
  const csvContent = propertiesToCSV(properties, columns);

  // Generate filename
  const filename = generateCSVFilename(filters);

  // Download file
  downloadCSV(csvContent, filename);
};

