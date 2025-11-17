/**
 * Formatting utilities for properties
 * Centralized formatters to avoid code duplication
 */

import type { BadgeVariant } from '@/components/ui/Badge';

/**
 * Format price in Mexican Pesos
 */
export const formatPrice = (price?: number): string => {
  if (!price) return 'Sin precio';
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  return `${formatted} MXN`;
};

/**
 * Get badge variant for property status
 */
export const getStatusVariant = (status: string): BadgeVariant => {
  switch (status) {
    case 'available':
      return 'success';
    case 'sold':
      return 'danger';
    case 'rented':
      return 'warning';
    case 'reserved':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date to short string
 */
export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Get badge variant for user role
 */
export const getRoleVariant = (role: string): BadgeVariant => {
  switch (role) {
    case 'property_admin':
      return 'info';      // Azul
    case 'property_manager':
      return 'warning';   // Amarillo/Naranja
    case 'property_associate':
      return 'default';   // Gris
    case 'administrator':
      return 'danger';    // Rojo (admin super)
    default:
      return 'default';   // Gris
  }
};
