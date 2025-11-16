/**
 * CSV Parser Utilities
 * Secure and robust CSV parsing for property imports
 */

/**
 * Allowed CSV headers (whitelist for security)
 * Prevents injection of malicious properties like __proto__, constructor, etc.
 */
export const ALLOWED_CSV_HEADERS = new Set([
  'title',
  'status',
  'state',
  'municipality',
  'neighborhood',
  'postal_code',
  'street',
  'patent',
  'price',
  'description',
  'google_maps_url'
]);

/**
 * Required CSV headers that must be present
 */
export const REQUIRED_CSV_HEADERS = [
  'title',
  'state',
  'municipality',
  'price'
];

/**
 * CSV parsing error types
 */
export class CSVParseError extends Error {
  readonly code: string;
  readonly row?: number;

  constructor(
    message: string,
    code: string,
    row?: number
  ) {
    super(message);
    this.name = 'CSVParseError';
    this.code = code;
    this.row = row;
  }
}

/**
 * Parsed CSV result
 */
export interface ParsedCSV<T = Record<string, string>> {
  data: T[];
  headers: string[];
  totalRows: number;
  skippedRows: number;
}

/**
 * Parse a single CSV line respecting quoted fields (RFC 4180 compliant)
 *
 * Handles:
 * - Quoted fields: "value"
 * - Escaped quotes: "value with ""quotes"""
 * - Commas inside quotes: "value, with, commas"
 * - Empty fields
 *
 * @param line - CSV line to parse
 * @returns Array of field values
 */
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" becomes "
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field (only if not inside quotes)
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());
  return result;
};

/**
 * Validate CSV headers against allowed and required headers
 *
 * @param headers - Parsed headers from CSV
 * @param allowedHeaders - Set of allowed header names
 * @param requiredHeaders - Array of required header names
 * @throws CSVParseError if validation fails
 */
export const validateHeaders = (
  headers: string[],
  allowedHeaders: Set<string> = ALLOWED_CSV_HEADERS,
  requiredHeaders: string[] = REQUIRED_CSV_HEADERS
): void => {
  // Normalize headers (lowercase, trim)
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

  // Check for required headers
  const missingHeaders = requiredHeaders.filter(
    required => !normalizedHeaders.includes(required)
  );

  if (missingHeaders.length > 0) {
    throw new CSVParseError(
      `Faltan columnas requeridas: ${missingHeaders.join(', ')}`,
      'MISSING_REQUIRED_HEADERS'
    );
  }

  // Check for invalid headers (security)
  const invalidHeaders = normalizedHeaders.filter(
    header => header && !allowedHeaders.has(header)
  );

  if (invalidHeaders.length > 0) {
    throw new CSVParseError(
      `Columnas no permitidas: ${invalidHeaders.join(', ')}. Columnas válidas: ${Array.from(allowedHeaders).join(', ')}`,
      'INVALID_HEADERS'
    );
  }
};

/**
 * Parse CSV text into structured data
 *
 * Features:
 * - Header validation and sanitization
 * - Empty line skipping
 * - RFC 4180 compliance
 * - Security: whitelist-based header filtering
 *
 * @param text - Raw CSV text content
 * @param options - Parsing options
 * @returns Parsed CSV data with metadata
 * @throws CSVParseError if parsing fails
 */
export const parseCSV = <T = Record<string, string>>(
  text: string,
  options: {
    allowedHeaders?: Set<string>;
    requiredHeaders?: string[];
    skipEmptyLines?: boolean;
  } = {}
): ParsedCSV<T> => {
  const {
    allowedHeaders = ALLOWED_CSV_HEADERS,
    requiredHeaders = REQUIRED_CSV_HEADERS,
    skipEmptyLines = true
  } = options;

  // Split into lines and filter
  const allLines = text.split('\n');
  const lines = skipEmptyLines
    ? allLines.map(line => line.trim()).filter(line => line.length > 0)
    : allLines;

  if (lines.length < 2) {
    throw new CSVParseError(
      'El archivo CSV está vacío o no tiene datos',
      'EMPTY_FILE'
    );
  }

  // Parse and validate headers
  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map(h => h.trim().toLowerCase());

  validateHeaders(headers, allowedHeaders, requiredHeaders);

  // Parse data rows
  const data: T[] = [];
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (skipEmptyLines && !line.trim()) {
      skippedRows++;
      continue;
    }

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    // Map values to headers (only allowed headers)
    headers.forEach((header, index) => {
      if (allowedHeaders.has(header)) {
        row[header] = values[index] || '';
      }
    });

    data.push(row as T);
  }

  return {
    data,
    headers,
    totalRows: lines.length - 1, // Excluding header
    skippedRows
  };
};

/**
 * Detect if CSV text might contain multi-line fields
 * Simple heuristic: checks for unclosed quotes in first 10 lines
 *
 * @param text - CSV text to analyze
 * @returns true if multi-line fields are likely present
 */
export const hasMultilineFields = (text: string): boolean => {
  const lines = text.split('\n').slice(0, 10);

  for (const line of lines) {
    let quoteCount = 0;
    for (const char of line) {
      if (char === '"') quoteCount++;
    }
    // Odd number of quotes suggests unclosed quote (multi-line field)
    if (quoteCount % 2 !== 0) {
      return true;
    }
  }

  return false;
};

/**
 * Detect likely encoding of CSV text
 * Simple detection for UTF-8 BOM
 *
 * @param text - CSV text to analyze
 * @returns Detected encoding
 */
export const detectEncoding = (text: string): 'utf-8' | 'utf-8-bom' => {
  // Check for UTF-8 BOM (Byte Order Mark)
  if (text.charCodeAt(0) === 0xFEFF) {
    return 'utf-8-bom';
  }
  return 'utf-8';
};

/**
 * Remove UTF-8 BOM if present
 *
 * @param text - Text that might contain BOM
 * @returns Text without BOM
 */
export const removeBOM = (text: string): string => {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
};
