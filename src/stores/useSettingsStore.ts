import { create } from 'zustand';
import type { SettingsState } from '../types/settings';
import { applyTheme } from '../services/themeService';

declare const window: Window & {
  wpPropertyDashboard: {
    wpApiUrl: string;
    nonce: string;
  };
};

const wpData = window.wpPropertyDashboard;

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        '/wp-json/property-dashboard/v1/settings',
        {
          headers: { 'X-WP-Nonce': wpData.nonce }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar configuración');
      }

      const data = await response.json();
      set({ settings: data, isLoading: false });

      // Aplicar tema al cargar
      applyTheme(data);
    } catch (error) {
      console.error('[loadSettings] Error:', error);
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      });
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        '/wp-json/property-dashboard/v1/settings',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpData.nonce
          },
          body: JSON.stringify(newSettings)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[updateSettings] Error response:', errorData);
        throw new Error('Error al guardar configuración');
      }

      const data = await response.json();
      set({ settings: data, isLoading: false });

      // Aplicar nuevo tema
      applyTheme(data);
    } catch (error) {
      console.error('[updateSettings] Error:', error);
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      });
      throw error;
    }
  },

  uploadLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(
        '/wp-json/property-dashboard/v1/settings/upload-logo',
        {
          method: 'POST',
          headers: {
            'X-WP-Nonce': wpData.nonce
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[uploadLogo] Error response:', errorData);
        throw new Error(errorData.message || 'Error al subir el logo');
      }

      const data = await response.json();

      // Reload settings to get updated logo
      await useSettingsStore.getState().loadSettings();

      return data;
    } catch (error) {
      console.error('[uploadLogo] Error:', error);
      set({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  },

  deleteLogo: async () => {
    try {
      const response = await fetch(
        '/wp-json/property-dashboard/v1/settings/delete-logo',
        {
          method: 'DELETE',
          headers: {
            'X-WP-Nonce': wpData.nonce
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el logo');
      }

      // Reload settings to get updated state
      await useSettingsStore.getState().loadSettings();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      throw error;
    }
  }
}));
