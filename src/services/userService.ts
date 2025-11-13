import type { User, UserProfile, UserProfileUpdate } from '../types/user.types';

// Get WordPress configuration
const config = window.wpPropertyDashboard || {
  apiUrl: '/wp-json/property-dashboard/v1',
  nonce: '',
};

/**
 * Get headers for API requests
 */
function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-WP-Nonce': config.nonce,
  };
}

class UserService {
  /**
   * Get all users (only property roles)
   */
  async getUsers(): Promise<User[]> {
    const url = `${config.apiUrl}/users`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const url = `${config.apiUrl}/profile`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UserProfileUpdate): Promise<{ success: boolean; message: string }> {
    const url = `${config.apiUrl}/profile`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const userService = new UserService();
export default userService;
