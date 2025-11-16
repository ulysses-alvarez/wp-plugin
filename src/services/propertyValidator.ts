/**
 * Property Validation Service
 * Centralized validation logic for property data
 */

/**
 * Import error types
 */
export interface ImportError {
  row: number;
  title: string;
  field: string;
  value: string;
  error: string;
  type: 'validation' | 'api' | 'system';
}

/**
 * Property data for validation (partial/CSV format)
 */
export interface PropertyData {
  title?: string;
  status?: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  postal_code?: string;
  street?: string;
  patent?: string;
  price?: string | number;
  description?: string;
  google_maps_url?: string;
}

/**
 * Allowed property status values
 */
export const ALLOWED_STATUSES = ['available', 'sold', 'rented', 'reserved'] as const;
export type PropertyStatus = typeof ALLOWED_STATUSES[number];

/**
 * Validation rules configuration
 */
export const VALIDATION_RULES = {
  required: ['title', 'status', 'state', 'municipality', 'patent'],
  optional: ['neighborhood', 'postal_code', 'street', 'price', 'description', 'google_maps_url'],

  formats: {
    postal_code: /^\d{5}$/,
    price: /^\d+(\.\d{1,2})?$/,
  },

  messages: {
    required: (field: string) => `El campo "${field}" es obligatorio`,
    invalidStatus: `Status debe ser: ${ALLOWED_STATUSES.join(', ')}`,
    invalidPostalCode: 'El código postal debe tener 5 dígitos',
    invalidPrice: 'El precio debe ser un número válido',
    invalidUrl: 'La URL debe comenzar con http:// o https://',
  }
};

/**
 * Validate a single property
 * Returns array of errors (empty if valid)
 *
 * @param property - Property data to validate
 * @param rowNumber - Row number for error reporting (optional)
 * @returns Array of validation errors
 */
export const validateProperty = (
  property: PropertyData,
  rowNumber: number = 0
): ImportError[] => {
  const errors: ImportError[] = [];
  const title = property.title?.trim() || '[sin título]';

  // Helper to add error
  const addError = (field: string, value: any, error: string) => {
    errors.push({
      row: rowNumber,
      title,
      field,
      value: String(value || ''),
      error,
      type: 'validation'
    });
  };

  // Validate required fields
  if (!property.title?.trim()) {
    addError('title', property.title, VALIDATION_RULES.messages.required('título'));
  }

  if (!property.status?.trim()) {
    addError('status', property.status, VALIDATION_RULES.messages.required('status'));
  } else if (!ALLOWED_STATUSES.includes(property.status as PropertyStatus)) {
    addError('status', property.status, VALIDATION_RULES.messages.invalidStatus);
  }

  if (!property.state?.trim()) {
    addError('state', property.state, VALIDATION_RULES.messages.required('estado'));
  }

  if (!property.municipality?.trim()) {
    addError('municipality', property.municipality, VALIDATION_RULES.messages.required('municipio'));
  }

  if (!property.patent?.trim()) {
    addError('patent', property.patent, VALIDATION_RULES.messages.required('patente'));
  }

  // Validate optional fields (if provided)
  if (property.price) {
    const priceStr = String(property.price).trim();
    if (priceStr && isNaN(Number(priceStr))) {
      addError('price', property.price, VALIDATION_RULES.messages.invalidPrice);
    }
  }

  if (property.postal_code) {
    const postalCode = String(property.postal_code).trim();
    if (postalCode && !VALIDATION_RULES.formats.postal_code.test(postalCode)) {
      addError('postal_code', property.postal_code, VALIDATION_RULES.messages.invalidPostalCode);
    }
  }

  if (property.google_maps_url) {
    const url = String(property.google_maps_url).trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      addError('google_maps_url', property.google_maps_url, VALIDATION_RULES.messages.invalidUrl);
    }
  }

  return errors;
};

/**
 * Validate multiple properties in batch
 *
 * @param properties - Array of properties to validate
 * @param startRow - Starting row number for error reporting
 * @returns Array of all validation errors
 */
export const validateProperties = (
  properties: PropertyData[],
  startRow: number = 1
): ImportError[] => {
  const allErrors: ImportError[] = [];

  properties.forEach((property, index) => {
    const rowNumber = startRow + index;
    const errors = validateProperty(property, rowNumber);
    allErrors.push(...errors);
  });

  return allErrors;
};

/**
 * Check if property data is valid
 *
 * @param property - Property to check
 * @returns true if valid, false otherwise
 */
export const isPropertyValid = (property: PropertyData): boolean => {
  const errors = validateProperty(property);
  return errors.length === 0;
};

/**
 * Get validation summary
 *
 * @param errors - Array of validation errors
 * @returns Summary object with counts by type
 */
export const getValidationSummary = (errors: ImportError[]) => {
  const errorsByField = errors.reduce((acc, error) => {
    acc[error.field] = (acc[error.field] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const errorsByType = errors.reduce((acc, error) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: errors.length,
    byField: errorsByField,
    byType: errorsByType,
    affectedRows: new Set(errors.map(e => e.row)).size
  };
};

/**
 * Format validation errors for display
 *
 * @param errors - Array of errors
 * @param maxErrors - Maximum number of errors to show
 * @returns Formatted error message
 */
export const formatValidationErrors = (
  errors: ImportError[],
  maxErrors: number = 10
): string => {
  if (errors.length === 0) return '';

  const summary = getValidationSummary(errors);
  let message = `Se encontraron ${summary.total} errores de validación en ${summary.affectedRows} filas.\n\n`;

  const displayErrors = errors.slice(0, maxErrors);
  displayErrors.forEach(error => {
    message += `Fila ${error.row} - ${error.field}: ${error.error}\n`;
  });

  if (errors.length > maxErrors) {
    message += `\n... y ${errors.length - maxErrors} errores más`;
  }

  return message;
};
