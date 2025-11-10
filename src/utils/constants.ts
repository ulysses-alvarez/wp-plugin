/**
 * Constants and configuration for Property Dashboard
 * Variables in English, labels in Spanish
 */

// Property Status Constants
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  RENTED: 'rented',
  RESERVED: 'reserved'
} as const;

export type PropertyStatus = typeof PROPERTY_STATUS[keyof typeof PROPERTY_STATUS];

export const PROPERTY_STATUS_OPTIONS = [
  { value: PROPERTY_STATUS.AVAILABLE, label: 'Disponible' },
  { value: PROPERTY_STATUS.SOLD, label: 'Vendida' },
  { value: PROPERTY_STATUS.RENTED, label: 'Alquilada' },
  { value: PROPERTY_STATUS.RESERVED, label: 'Reservada' }
] as const;

// User Roles Constants
export const USER_ROLES = {
  ADMIN: 'administrator',
  MANAGER: 'property_manager',
  ASSOCIATE: 'property_associate'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  administrator: 'Administrador',
  property_manager: 'Gerente',
  property_associate: 'Asociado'
};

// Mexican States
export const MEXICAN_STATES = [
  { value: 'aguascalientes', label: 'Aguascalientes' },
  { value: 'baja_california', label: 'Baja California' },
  { value: 'baja_california_sur', label: 'Baja California Sur' },
  { value: 'campeche', label: 'Campeche' },
  { value: 'chiapas', label: 'Chiapas' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'cdmx', label: 'Ciudad de México' },
  { value: 'coahuila', label: 'Coahuila' },
  { value: 'colima', label: 'Colima' },
  { value: 'durango', label: 'Durango' },
  { value: 'guanajuato', label: 'Guanajuato' },
  { value: 'guerrero', label: 'Guerrero' },
  { value: 'hidalgo', label: 'Hidalgo' },
  { value: 'jalisco', label: 'Jalisco' },
  { value: 'mexico', label: 'Estado de México' },
  { value: 'michoacan', label: 'Michoacán' },
  { value: 'morelos', label: 'Morelos' },
  { value: 'nayarit', label: 'Nayarit' },
  { value: 'nuevo_leon', label: 'Nuevo León' },
  { value: 'oaxaca', label: 'Oaxaca' },
  { value: 'puebla', label: 'Puebla' },
  { value: 'queretaro', label: 'Querétaro' },
  { value: 'quintana_roo', label: 'Quintana Roo' },
  { value: 'san_luis_potosi', label: 'San Luis Potosí' },
  { value: 'sinaloa', label: 'Sinaloa' },
  { value: 'sonora', label: 'Sonora' },
  { value: 'tabasco', label: 'Tabasco' },
  { value: 'tamaulipas', label: 'Tamaulipas' },
  { value: 'tlaxcala', label: 'Tlaxcala' },
  { value: 'veracruz', label: 'Veracruz' },
  { value: 'yucatan', label: 'Yucatán' },
  { value: 'zacatecas', label: 'Zacatecas' }
] as const;

// Pagination Options
export const PAGINATION_OPTIONS = [
  { value: 5, label: '5 por página' },
  { value: 10, label: '10 por página' },
  { value: 20, label: '20 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
] as const;

// Default pagination
export const DEFAULT_PER_PAGE = 20;
export const DEFAULT_PAGE = 1;

// API Configuration
export const API_ENDPOINTS = {
  PROPERTIES: '/properties',
  USERS: '/users',
  STATS: '/stats'
} as const;

// View Modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
} as const;

export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];

// Currency
export const CURRENCY_SYMBOL = 'MXN';
export const CURRENCY_FORMAT = 'es-MX';

// Date Format
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Advanced Search Field Types
export interface SearchOption {
  value: string;
  label: string;
}

export interface SearchContext {
  value: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: readonly SearchOption[];
}

// Advanced Search Field Configurations
export const SEARCH_CONTEXTS: SearchContext[] = [
  {
    value: 'all',
    label: 'Búsqueda General',
    type: 'text',
    placeholder: 'Buscar por título, patente, municipio...'
  },
  {
    value: 'title',
    label: 'Título',
    type: 'text',
    placeholder: 'Buscar por título...'
  },
  {
    value: 'patent',
    label: 'Patente',
    type: 'text',
    placeholder: 'Buscar por patente...'
  },
  {
    value: 'status',
    label: 'Estado Propiedad',
    type: 'select',
    options: PROPERTY_STATUS_OPTIONS
  },
  {
    value: 'state',
    label: 'Estado República',
    type: 'select',
    options: MEXICAN_STATES
  },
  {
    value: 'municipality',
    label: 'Municipio',
    type: 'text',
    placeholder: 'Buscar por municipio...'
  },
  {
    value: 'street',
    label: 'Calle',
    type: 'text',
    placeholder: 'Buscar por calle...'
  },
  {
    value: 'postal_code',
    label: 'Código Postal',
    type: 'number',
    placeholder: 'Ej: 44100'
  },
  {
    value: 'price',
    label: 'Precio',
    type: 'number',
    placeholder: 'Precio exacto'
  }
];
