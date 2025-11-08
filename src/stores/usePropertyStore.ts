/**
 * Property Store - Zustand
 * Manages property state and actions
 */

import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Property } from '../utils/permissions';
import type { PropertyQueryParams, PropertyData } from '../services/api';
import {
  fetchProperties,
  fetchProperty,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty
} from '../services/api';

// Store State Interface
interface PropertyState {
  // State
  properties: Property[];
  selectedProperty: Property | null;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;

  // Filters
  filters: {
    search: string;
    status: string;
    state: string;
    municipality: string;
  };

  // Sort
  sortBy: 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality';
  sortOrder: 'asc' | 'desc';

  // Actions
  loadProperties: (params?: PropertyQueryParams) => Promise<void>;
  loadProperty: (id: number) => Promise<void>;
  createProperty: (data: PropertyData) => Promise<Property | null>;
  updateProperty: (id: number, data: Partial<PropertyData>) => Promise<Property | null>;
  deleteProperty: (id: number) => Promise<boolean>;

  // Filter Actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setStateFilter: (state: string) => void;
  setMunicipalityFilter: (municipality: string) => void;
  clearFilters: () => void;

  // Pagination Actions
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Sort Actions
  setSortBy: (sortBy: 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;

  // Selection Actions
  selectProperty: (property: Property | null) => void;

  // Utility Actions
  reset: () => void;
}

// Initial State
const initialState = {
  properties: [],
  selectedProperty: null,
  loading: false,
  error: null,
  currentPage: 1,
  perPage: 20,
  total: 0,
  totalPages: 1,
  filters: {
    search: '',
    status: '',
    state: '',
    municipality: ''
  },
  sortBy: 'date' as const,
  sortOrder: 'desc' as const
};

/**
 * Create Property Store
 */
export const usePropertyStore = create<PropertyState>((set, get) => ({
  ...initialState,

  /**
   * Load properties with filters and pagination
   */
  loadProperties: async (params?: PropertyQueryParams) => {
    set({ loading: true, error: null });

    try {
      const { filters, currentPage, perPage, sortBy, sortOrder } = get();

      const queryParams: PropertyQueryParams = {
        page: params?.page ?? currentPage,
        per_page: params?.per_page ?? perPage,
        search: params?.search ?? filters.search,
        status: params?.status ?? filters.status,
        state: params?.state ?? filters.state,
        municipality: params?.municipality ?? filters.municipality,
        orderby: params?.orderby ?? sortBy,
        order: params?.order ?? sortOrder
      };

      const response = await fetchProperties(queryParams);

      set({
        properties: response.data,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar propiedades';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  },

  /**
   * Load a single property by ID
   */
  loadProperty: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const property = await fetchProperty(id);
      set({ selectedProperty: property, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar propiedad';
      set({ error: errorMessage, loading: false, selectedProperty: null });
      toast.error(errorMessage);
    }
  },

  /**
   * Create a new property
   */
  createProperty: async (data: PropertyData) => {
    set({ loading: true, error: null });

    try {
      const newProperty = await apiCreateProperty(data);

      // Add to properties list
      set(state => ({
        properties: [newProperty, ...state.properties],
        total: state.total + 1,
        loading: false,
        error: null
      }));

      toast.success('Propiedad creada exitosamente');
      return newProperty;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear propiedad';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  /**
   * Update an existing property
   */
  updateProperty: async (id: number, data: Partial<PropertyData>) => {
    set({ loading: true, error: null });

    try {
      const updatedProperty = await apiUpdateProperty(id, data);

      // Update in properties list
      set(state => ({
        properties: state.properties.map(p =>
          p.id === id ? updatedProperty : p
        ),
        selectedProperty: state.selectedProperty?.id === id
          ? updatedProperty
          : state.selectedProperty,
        loading: false,
        error: null
      }));

      toast.success('Propiedad actualizada exitosamente');
      return updatedProperty;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar propiedad';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return null;
    }
  },

  /**
   * Delete a property
   */
  deleteProperty: async (id: number) => {
    set({ loading: true, error: null });

    try {
      await apiDeleteProperty(id);

      // Remove from properties list
      set(state => ({
        properties: state.properties.filter(p => p.id !== id),
        total: state.total - 1,
        selectedProperty: state.selectedProperty?.id === id
          ? null
          : state.selectedProperty,
        loading: false,
        error: null
      }));

      toast.success('Propiedad eliminada exitosamente');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar propiedad';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      return false;
    }
  },

  /**
   * Filter Actions
   */
  setSearch: (search: string) => {
    set(state => ({
      filters: { ...state.filters, search },
      currentPage: 1 // Reset to first page when filtering
    }));
  },

  setStatusFilter: (status: string) => {
    set(state => ({
      filters: { ...state.filters, status },
      currentPage: 1
    }));
  },

  setStateFilter: (state: string) => {
    set(prevState => ({
      filters: { ...prevState.filters, state },
      currentPage: 1
    }));
  },

  setMunicipalityFilter: (municipality: string) => {
    set(state => ({
      filters: { ...state.filters, municipality },
      currentPage: 1
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        status: '',
        state: '',
        municipality: ''
      },
      currentPage: 1
    });
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
   * Sort Actions
   */
  setSortBy: (sortBy: 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality') => {
    set({ sortBy, currentPage: 1 });
  },

  setSortOrder: (sortOrder: 'asc' | 'desc') => {
    set({ sortOrder, currentPage: 1 });
  },

  /**
   * Selection Actions
   */
  selectProperty: (property: Property | null) => {
    set({ selectedProperty: property });
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
export const useProperties = () => usePropertyStore(state => state.properties);
export const useSelectedProperty = () => usePropertyStore(state => state.selectedProperty);
export const usePropertyLoading = () => usePropertyStore(state => state.loading);
export const usePropertyError = () => usePropertyStore(state => state.error);
export const usePropertyFilters = () => usePropertyStore(state => state.filters);
export const usePropertyPagination = () => usePropertyStore(state => ({
  currentPage: state.currentPage,
  perPage: state.perPage,
  total: state.total,
  totalPages: state.totalPages
}));
