/**
 * Permission utilities for Property Dashboard
 * Handles role-based access control (RBAC)
 */

import { USER_ROLES, USER_ROLE_LABELS, PROPERTY_STATUS_OPTIONS } from './constants';
import type { UserRole, PropertyStatus } from './constants';

// Property Type Definition
export interface Property {
  id: number;
  title: string;
  description?: string;
  status: PropertyStatus;
  author_id: number;
  state?: string;
  municipality?: string;
  neighborhood?: string;
  postal_code?: string;
  street?: string;
  patent?: string;
  price?: number;
  google_maps_url?: string;
  attachment_id?: number;
  created_at?: string;
  updated_at?: string;
}

// WordPress User Type
export interface WPUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  capabilities: Record<string, boolean>;
}

/**
 * Get current user from WordPress data
 */
const getCurrentUser = (): WPUser | null => {
  const wpUser = window.wpPropertyDashboard?.currentUser;
  if (!wpUser) return null;

  // Type assertion to ensure role is a valid UserRole
  return {
    ...wpUser,
    role: wpUser.role as UserRole
  };
};

/**
 * Check if user has specific capability
 */
export const can = (capability: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.capabilities?.[capability] === true;
};

/**
 * Role checks
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === USER_ROLES.ADMIN;
};

export const isManager = (): boolean => {
  const user = getCurrentUser();
  return user?.role === USER_ROLES.MANAGER;
};

export const isAssociate = (): boolean => {
  const user = getCurrentUser();
  return user?.role === USER_ROLES.ASSOCIATE;
};

/**
 * Get current user ID
 */
export const getCurrentUserId = (): number | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Property-specific permissions
 */

/**
 * Check if user can view a property
 */
export const canViewProperty = (property: Property): boolean => {
  if (can('view_all_properties')) return true;

  if (can('view_properties')) {
    const userId = getCurrentUserId();
    return property.author_id === userId;
  }

  return false;
};

/**
 * Check if user can edit a property
 */
export const canEditProperty = (property: Property): boolean => {
  if (can('edit_others_properties')) return true;

  if (can('edit_properties')) {
    const userId = getCurrentUserId();
    return property.author_id === userId;
  }

  return false;
};

/**
 * Check if user can delete a property
 */
export const canDeleteProperty = (property: Property): boolean => {
  if (can('delete_others_properties')) return true;

  if (can('delete_properties')) {
    const userId = getCurrentUserId();
    return property.author_id === userId;
  }

  return false;
};

/**
 * General capability checks
 */
export const canCreateProperty = (): boolean => can('create_properties');

export const canAssignProperty = (): boolean => can('assign_properties');

export const canManageRoles = (): boolean => can('manage_property_roles');

export const canExportData = (): boolean => can('export_properties');

export const canViewAllProperties = (): boolean => can('view_all_properties');

export const canViewStatistics = (): boolean => can('view_statistics') || can('view_team_statistics') || can('view_own_statistics');

/**
 * Get role label in Spanish
 */
export const getRoleLabel = (roleSlug: UserRole): string => {
  return USER_ROLE_LABELS[roleSlug] || roleSlug;
};

/**
 * Get status label in Spanish
 */
export const getStatusLabel = (status: PropertyStatus): string => {
  const statusOption = PROPERTY_STATUS_OPTIONS.find(opt => opt.value === status);
  return statusOption?.label || status;
};

/**
 * Filter properties based on user permissions
 * Associates should only see their own properties
 */
export const filterPropertiesByPermissions = (properties: Property[]): Property[] => {
  if (canViewAllProperties()) {
    return properties;
  }

  const userId = getCurrentUserId();
  if (!userId) return [];

  return properties.filter(property => property.author_id === userId);
};

/**
 * Check if user can perform action on property
 */
export const canPerformAction = (action: 'view' | 'edit' | 'delete', property: Property): boolean => {
  switch (action) {
    case 'view':
      return canViewProperty(property);
    case 'edit':
      return canEditProperty(property);
    case 'delete':
      return canDeleteProperty(property);
    default:
      return false;
  }
};

/**
 * Get user capabilities summary
 */
export const getUserCapabilitiesSummary = (): {
  canCreate: boolean;
  canViewAll: boolean;
  canEditOwn: boolean;
  canEditOthers: boolean;
  canDeleteOwn: boolean;
  canDeleteOthers: boolean;
  canAssign: boolean;
  canManageRoles: boolean;
  canExport: boolean;
  role: UserRole | null;
  roleLabel: string;
} => {
  const user = getCurrentUser();

  return {
    canCreate: canCreateProperty(),
    canViewAll: canViewAllProperties(),
    canEditOwn: can('edit_properties'),
    canEditOthers: can('edit_others_properties'),
    canDeleteOwn: can('delete_properties'),
    canDeleteOthers: can('delete_others_properties'),
    canAssign: canAssignProperty(),
    canManageRoles: canManageRoles(),
    canExport: canExportData(),
    role: user?.role || null,
    roleLabel: user ? getRoleLabel(user.role) : 'Sin rol'
  };
};
