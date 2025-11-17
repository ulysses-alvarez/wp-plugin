/**
 * CSV Formatter Utilities
 * Functions to format and generate CSV files
 */

import type { Property } from '@/utils/permissions';
import type { CSVColumn } from '@/types/export';
import { getStateLabel } from './constants';
import { getStatusLabel } from './permissions';

export const DEFAULT_COLUMNS: CSVColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Título' },
  { key: 'patent', label: 'Patente' },
  { key: 'status', label: 'Estado' },
  { key: 'state', label: 'Estado República' },
  { key: 'municipality', label: 'Municipio' },
  { key: 'neighborhood', label: 'Colonia' },
  { key: 'street', label: 'Calle' },
  { key: 'postal_code', label: 'Código Postal' },
  { key: 'price', label: 'Precio' },
  { key: 'description', label: 'Descripción' },
  { key: 'google_maps_url', label: 'URL Google Maps' },
  { key: 'attachment_url', label: 'Ficha Técnica (URL)' },
  { key: 'created_at', label: 'Fecha Creación' },
  { key: 'created_by', label: 'Creado por' },
  { key: 'modified_date', label: 'Última Modificación' },
  { key: 'modified_by', label: 'Modificado por' }
];

/**
 * Escape CSV value to handle commas, quotes and newlines
 */
export const escapeCSVValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Si contiene comas, comillas o saltos de línea, escapar
  if (stringValue.includes(',') || 
      stringValue.includes('"') || 
      stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Format property value for display in CSV
 */
const formatPropertyValue = (property: Property, key: string): string => {
  const value = property[key as keyof Property];

  // Format specific fields
  switch (key) {
    case 'status':
      return getStatusLabel(String(value) as any);
    case 'state':
      return getStateLabel(String(value));
    case 'price':
      return value ? String(value) : '0';
    case 'created_at':
      // WordPress date format
      return value ? new Date(String(value)).toLocaleDateString('es-MX') : '';
    case 'created_by':
      // Get name from audit trail
      return property.audit?.created_by?.name || 'N/A';
    case 'modified_by':
      // Get name from audit trail
      return property.audit?.modified_by?.name || 'N/A';
    case 'modified_date':
      // Get modified date from audit trail
      return property.audit?.modified_date
        ? new Date(property.audit.modified_date).toLocaleDateString('es-MX')
        : 'N/A';
    case 'attachment_url':
      // URL of the technical file
      return property.attachment_url || '';
    default:
      return value ? String(value) : '';
  }
};

/**
 * Convert properties array to CSV string
 */
export const propertiesToCSV = (
  properties: Property[],
  columns: CSVColumn[]
): string => {
  // Header
  const headers = columns.map(col => escapeCSVValue(col.label));
  const csvRows = [headers.join(',')];
  
  // Data rows
  properties.forEach(property => {
    const row = columns.map(col => {
      const value = formatPropertyValue(property, String(col.key));
      return escapeCSVValue(value);
    });
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Generate filename for CSV export
 */
export const generateCSVFilename = (
  filters: { searchField: string; searchValue: string }
): string => {
  const date = new Date().toISOString().split('T')[0];
  const filterPart = filters.searchValue && filters.searchField !== 'all'
    ? `_${filters.searchField}_${filters.searchValue}` 
    : '';
  
  return `propiedades${filterPart}_${date}.csv`
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');
};

