/**
 * Property Store - Zustand
 * Manages property state and actions
 */

import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Property } from '../utils/permissions';
import type { PropertyQueryParams, PropertyData } from '../services/api';
import type { PropertyStatus, BulkResult } from '../types/bulk';
import {
  fetchProperties,
  fetchProperty,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty,
  bulkDeleteProperties as apiBulkDeleteProperties,
  bulkUpdateStatus as apiBulkUpdateStatus,
  bulkUpdatePatent as apiBulkUpdatePatent
} from '../services/api';
import { PersistentLogger } from '../utils/persistentLogger';

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
    searchField: string;  // Field context for advanced search
    searchValue: string;  // Value for advanced search
  };

  // Sort
  sortBy: 'date' | 'title' | 'price' | 'status' | 'state' | 'municipality';
  sortOrder: 'asc' | 'desc';

  // Actions
  loadProperties: (params?: PropertyQueryParams) => Promise<void>;
  loadProperty: (id: number) => Promise<void>;
  createProperty: (data: PropertyData, silent?: boolean) => Promise<Property | null>;
  updateProperty: (id: number, data: Partial<PropertyData>) => Promise<Property | null>;
  deleteProperty: (id: number) => Promise<boolean>;

  // Bulk Actions
  bulkDeleteProperties: (propertyIds: number[]) => Promise<BulkResult>;
  bulkUpdateStatus: (propertyIds: number[], status: PropertyStatus) => Promise<BulkResult>;
  bulkUpdatePatent: (propertyIds: number[], patent: string) => Promise<BulkResult>;

  // Filter Actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setStateFilter: (state: string) => void;
  setMunicipalityFilter: (municipality: string) => void;
  setFieldSearch: (field: string, value: string) => void;  // Advanced search
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
    municipality: '',
    searchField: 'all',
    searchValue: ''
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
    PersistentLogger.log('status', 'reload', { message: 'loadProperties called', params });
    set({ loading: true, error: null });

    try {
      const { filters, currentPage, perPage, sortBy, sortOrder } = get();

      // Build query params, prioritizing advanced search over old filters
      const queryParams: PropertyQueryParams = {
        page: params?.page ?? currentPage,
        per_page: params?.per_page ?? perPage,
        orderby: params?.orderby ?? sortBy,
        order: params?.order ?? sortOrder
      };

      // Use advanced search if available
      if (filters.searchField && filters.searchValue) {
        queryParams.search_field = filters.searchField;
        queryParams.search_value = filters.searchValue;
      } else {
        // Fallback to old filter format for backward compatibility
        queryParams.search = params?.search ?? filters.search;
        queryParams.status = params?.status ?? filters.status;
        queryParams.state = params?.state ?? filters.state;
        queryParams.municipality = params?.municipality ?? filters.municipality;
      }

      PersistentLogger.log('status', 'reload', { message: 'Fetching properties from server', queryParams });
      const response = await fetchProperties(queryParams);

      // Log first 3 properties to check their status
      const sampleProperties = response.data.slice(0, 3).map(p => ({ id: p.id, title: p.title, status: p.status }));
      PersistentLogger.log('status', 'reload', {
        message: 'Server returned properties',
        total: response.data.length,
        sampleProperties
      });

      set({
        properties: response.data,
        total: response.total || 0,
        totalPages: response.totalPages || 1,
        currentPage: response.currentPage || 1,
        loading: false,
        error: null
      });

      PersistentLogger.log('status', 'reload', { message: 'Store updated with server data' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar propiedades';
      PersistentLogger.log('status', 'error', { error: errorMessage, context: 'loadProperties' });
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
  createProperty: async (data: PropertyData, silent = false) => {
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

      if (!silent) {
        toast.success('Propiedad creada exitosamente');
      }
      return newProperty;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear propiedad';
      set({ error: errorMessage, loading: false });
      if (!silent) {
        toast.error(errorMessage);
      }
      throw error; // Re-throw for CSV import error handling
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
   * Bulk delete properties
   */
  bulkDeleteProperties: async (propertyIds: number[]) => {
    set({ loading: true, error: null });

    try {
      const result = await apiBulkDeleteProperties(propertyIds);

      // Remove successfully deleted properties from store
      set(state => ({
        properties: state.properties.filter(p => !result.success.includes(p.id)),
        total: state.total - result.success.length,
        selectedProperty: result.success.includes(state.selectedProperty?.id || 0)
          ? null
          : state.selectedProperty,
        loading: false,
        error: null
      }));

      // Show result toast
      if (result.failed.length === 0) {
        toast.success(`✓ ${result.success.length} ${result.success.length === 1 ? 'propiedad eliminada' : 'propiedades eliminadas'} exitosamente`);
      } else {
        toast.error(`✓ ${result.success.length} eliminadas, ✗ ${result.failed.length} fallaron. Revisa los permisos.`, {
          duration: 5000
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar propiedades';
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Bulk update property status
   */
  bulkUpdateStatus: async (propertyIds: number[], status: PropertyStatus) => {
    PersistentLogger.log('status', 'start', { propertyIds, status });
    set({ loading: true, error: null });

    try {
      PersistentLogger.log('status', 'api_call', { propertyIds, status });
      const result = await apiBulkUpdateStatus(propertyIds, status);
      PersistentLogger.log('status', 'api_response', result);

      // Update successfully updated properties in store
      PersistentLogger.log('status', 'store_update', { updatingProperties: result.success });
      set(state => ({
        properties: state.properties.map(p =>
          result.success.includes(p.id)
            ? { ...p, status }
            : p
        ),
        selectedProperty: result.success.includes(state.selectedProperty?.id || 0) && state.selectedProperty
          ? { ...state.selectedProperty, status }
          : state.selectedProperty,
        loading: false,
        error: null
      }));

      // Show result toast
      if (result.failed.length === 0) {
        toast.success(`✓ ${result.success.length} ${result.success.length === 1 ? 'propiedad actualizada' : 'propiedades actualizadas'} exitosamente`);
      } else {
        toast.error(`✓ ${result.success.length} actualizadas, ✗ ${result.failed.length} fallaron. Revisa los permisos.`, {
          duration: 5000
        });
      }

      PersistentLogger.log('status', 'complete', { success: result.success.length, failed: result.failed.length });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estados';
      PersistentLogger.log('status', 'error', { error: errorMessage });
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  /**
   * Bulk update property patents (simplified version)
   */
  bulkUpdatePatent: async (propertyIds: number[], patent: string) => {
    PersistentLogger.log('patent', 'start', { propertyIds, patent });
    set({ loading: true, error: null });

    try {
      PersistentLogger.log('patent', 'api_call', { propertyIds, patent });
      const result = await apiBulkUpdatePatent(propertyIds, patent);
      PersistentLogger.log('patent', 'api_response', result);

      // After successful update, reload properties to get the updated patents from server
      PersistentLogger.log('patent', 'reload', { message: 'Reloading properties from server' });
      await get().loadProperties();
      PersistentLogger.log('patent', 'reload', { message: 'Properties reloaded successfully' });

      // Show result toast
      if (result.failed.length === 0) {
        toast.success(`✓ ${result.success.length} ${result.success.length === 1 ? 'patente actualizada' : 'patentes actualizadas'} exitosamente`);
      } else {
        toast.error(`✓ ${result.success.length} actualizadas, ✗ ${result.failed.length} fallaron. Revisa los errores.`, {
          duration: 5000
        });
      }

      PersistentLogger.log('patent', 'complete', { success: result.success.length, failed: result.failed.length });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar patentes';
      PersistentLogger.log('patent', 'error', { error: errorMessage });
      set({ error: errorMessage, loading: false });
      toast.error(errorMessage);
      throw error;
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

  setFieldSearch: (searchField: string, searchValue: string) => {
    set(state => ({
      filters: {
        ...state.filters,
        searchField,
        searchValue,
        // Clear old filter format when using advanced search
        search: '',
        status: '',
        state: '',
        municipality: ''
      },
      currentPage: 1
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        status: '',
        state: '',
        municipality: '',
        searchField: 'all',
        searchValue: ''
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
