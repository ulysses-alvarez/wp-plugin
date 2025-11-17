/**
 * User Store - Zustand
 * Manages user state and actions (simplified version of PropertyStore)
 */

import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { User } from '../types/user.types';
import { userService } from '../services/userService';

// Store State Interface
interface UserState {
  // State
  users: User[];
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;

  // Actions
  loadUsers: () => Promise<void>;

  // Pagination Actions
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Utility Actions
  reset: () => void;
}

// Initial State
const initialState = {
  users: [],
  loading: false,
  error: null,
  currentPage: 1,
  perPage: 20,
  total: 0,
  totalPages: 1,
};

/**
 * Create User Store
 */
export const useUserStore = create<UserState>((set, get) => ({
  ...initialState,

  /**
   * Load users with pagination
   */
  loadUsers: async () => {
    set({ loading: true, error: null });

    try {
      const { currentPage, perPage } = get();

      const response = await userService.getUsers(currentPage, perPage);

      set({
        users: response.users,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar usuarios';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Pagination Actions
   */
  setPage: (page: number) => {
    set({ currentPage: page });
  },

  setPerPage: (perPage: number) => {
    set({ perPage, currentPage: 1 });
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  }
}));

/**
 * Selectors (for better performance)
 */
export const useUsers = () => useUserStore(state => state.users);
export const useUserLoading = () => useUserStore(state => state.loading);
export const useUserError = () => useUserStore(state => state.error);
export const useUserPagination = () => useUserStore(state => ({
  currentPage: state.currentPage,
  perPage: state.perPage,
  total: state.total,
  totalPages: state.totalPages
}));
