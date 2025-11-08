/**
 * API Service for Property Dashboard
 * Handles all REST API calls to WordPress backend
 */

import type { Property } from '../utils/permissions';

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
  orderby?: 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality';
  order?: 'asc' | 'desc';
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
const getHeaders = (): HeadersInit => {
  const config = getAPIConfig();
  return {
    'Content-Type': 'application/json',
    'X-WP-Nonce': config.nonce
  };
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
    headers: getHeaders(),
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
 * Upload file/attachment
 */
export const uploadFile = async (file: File): Promise<{ id: number; url: string }> => {
  const config = getAPIConfig();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${config.wpApiUrl}/media`, {
    method: 'POST',
    headers: {
      'X-WP-Nonce': config.nonce
    },
    body: formData
  });

  if (!response.ok) {
    await handleAPIError(response);
  }

  const data = await response.json();

  return {
    id: data.id,
    url: data.source_url
  };
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
 * Export API methods as default
 */
export default {
  fetchProperties,
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadFile,
  fetchStatistics
};
