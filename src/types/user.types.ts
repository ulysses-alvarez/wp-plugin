/**
 * User role types
 */
export type UserRole = 'administrator' | 'property_admin' | 'property_manager' | 'property_associate';

/**
 * User interface
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  registered: string;
  first_name: string;
  last_name: string;
}

/**
 * User profile interface (for current user)
 */
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  role_label: string;
}

/**
 * User profile update data
 */
export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  password?: string;
}
