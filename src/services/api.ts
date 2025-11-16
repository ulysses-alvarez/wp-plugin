/**
 * API Service for Property Dashboard
 * Handles all REST API calls to WordPress backend
 */

import type { Property } from '../utils/permissions';
import type { BulkResult, PropertyStatus } from '../types/bulk';

// API Response Types
export interface APIResponse<T> {
  data: T;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface APIError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

// Query Parameters for fetching properties
export interface PropertyQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  state?: string;
  municipality?: string;
  author?: number;
  orderby?: 'ID' | 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality';
  order?: 'asc' | 'desc';
  search_field?: string;  // Field context for advanced search
  search_value?: string;  // Value for advanced search
}

// Property Create/Update Data
export interface PropertyData {
  title: string;
  description?: string;
  status?: string;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  postal_code?: string;
  street?: string;
  patent?: string;
  price?: number;
  google_maps_url?: string;
  attachment_id?: number;
}

/**
 * Get WordPress API configuration
 */
const getAPIConfig = () => {
  if (!window.wpPropertyDashboard) {
    throw new Error('WordPress data not available');
  }
  return window.wpPropertyDashboard;
};

/**
 * Get default headers for API requests
 */
const getHeaders = (includeDashboardUpdate = false): HeadersInit => {
  const config = getAPIConfig();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-WP-Nonce': config.nonce
  };
  
  if (includeDashboardUpdate) {
    headers['X-Dashboard-Update'] = 'true';
  }
  
  return headers;
};

/**
 * Handle API errors
 */
const handleAPIError = async (response: Response): Promise<never> => {
  let errorData: APIError;

  try {
    errorData = await response.json();
  } catch {
    errorData = {
      code: 'unknown_error',
      message: `Error HTTP ${response.status}: ${response.statusText}`,
      data: { status: response.status }
    };
  }

  throw new Error(errorData.message || 'Error desconocido');
};

/**
 * Build query string from parameters
 */
const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });

  return query.toString();
};

/**
 * Property API Methods
 */

/**
 * Fetch properties with optional filters
 */
export const fetchProperties = async (
  params: PropertyQueryParams = {}
): Promise<APIResponse<Property[]>> => {
  const config = getAPIConfig();
  const queryString = buildQueryString(params);
  const url = `${config.apiUrl}/properties${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  const data: Property[] = await response.json();

  // Extract pagination info from headers
  const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

  return {
    data,
    total,
    totalPages,
    currentPage: params.page || 1
  };
};

/**
 * Fetch a single property by ID
 */
export const fetchProperty = async (id: number): Promise<Property> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Create a new property
 */
export const createProperty = async (data: PropertyData): Promise<Property> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Update an existing property
 */
export const updateProperty = async (
  id: number,
  data: Partial<PropertyData>
): Promise<Property> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/${id}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(true), // Include X-Dashboard-Update header
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Delete a property
 */
export const deleteProperty = async (id: number): Promise<{ deleted: boolean }> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Upload file/attachment with progress tracking
 */
export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ id: number; url: string }> => {
  const config = getAPIConfig();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    // Handle successful upload
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            id: data.id,
            url: data.source_url
          });
        } catch (error) {
          reject(new Error('Error al procesar respuesta del servidor'));
        }
      } else {
        // Handle HTTP errors
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || `Error HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Error HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      }
    });

    // Handle network errors
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red durante la carga del archivo'));
    });

    // Handle upload abortion
    xhr.addEventListener('abort', () => {
      reject(new Error('Carga de archivo cancelada'));
    });

    // Configure and send request
    xhr.open('POST', `${config.wpApiUrl}/media`);
    xhr.setRequestHeader('X-WP-Nonce', config.nonce);

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
};

/**
 * Fetch price ranges (10 dynamic ranges based on min/max prices)
 */
export interface PriceRange {
  value: string;
  label: string;
  min: number;
  max: number;
}

export const fetchPriceRanges = async (): Promise<PriceRange[]> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/price-ranges`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Fetch unique patents from all properties
 */
export const fetchUniquePatents = async (): Promise<string[]> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/patents`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Statistics API (if needed in future)
 */
export const fetchStatistics = async (): Promise<any> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/stats`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Bulk delete properties
 */
export const bulkDeleteProperties = async (propertyIds: number[]): Promise<BulkResult> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/bulk-delete`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ property_ids: propertyIds })
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Bulk update property status
 */
export const bulkUpdateStatus = async (
  propertyIds: number[],
  status: PropertyStatus
): Promise<BulkResult> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/bulk-update-status`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(true), // Include X-Dashboard-Update header
    body: JSON.stringify({
      property_ids: propertyIds,
      status
    })
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Bulk update property patents (simplified version)
 */
export const bulkUpdatePatent = async (
  propertyIds: number[],
  patent: string
): Promise<BulkResult> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/bulk-update-patent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(true), // Include X-Dashboard-Update header
    body: JSON.stringify({
      property_ids: propertyIds,
      patent
    })
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Bulk download property attachments (Fichas Técnicas)
 * If 1 file: returns direct download URL
 * If 2+ files: returns ZIP URL
 * If no files: returns success=false with message
 */
export interface BulkDownloadResult {
  success: boolean;
  single_file?: boolean;
  download_url?: string;
  filename?: string;
  files_count: number;
  files_without_attachment: number;
  message?: string; // Present when success=false (no attachments available)
}

export const bulkDownloadSheets = async (
  propertyIds: number[]
): Promise<BulkDownloadResult> => {
  const config = getAPIConfig();
  const url = `${config.apiUrl}/properties/bulk-download?property_ids=${propertyIds.join(',')}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  return response.json();
};

/**
 * Export API methods as default
 */
export default {
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadFile,
  fetchPriceRanges,
  fetchUniquePatents,
  fetchStatistics,
  bulkDeleteProperties,
  bulkUpdateStatus,
  bulkUpdatePatent,
  bulkDownloadSheets
};
