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
    console.log('[loadSettings] Loading settings...');
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        '/wp-json/property-dashboard/v1/settings',
        {
          headers: { 'X-WP-Nonce': wpData.nonce }
        }
      );

      console.log('[loadSettings] Response status:', response.status);

      if (!response.ok) {
        throw new Error('Error al cargar configuración');
      }

      const data = await response.json();
      console.log('[loadSettings] Settings data:', data);
      set({ settings: data, isLoading: false });

      // Aplicar tema al cargar
      console.log('[loadSettings] Applying theme with color:', data.primaryColor);
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
    console.log('[updateSettings] Updating settings with:', newSettings);
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

      console.log('[updateSettings] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[updateSettings] Error response:', errorData);
        throw new Error('Error al guardar configuración');
      }

      const data = await response.json();
      console.log('[updateSettings] Updated settings:', data);
      set({ settings: data, isLoading: false });

      // Aplicar nuevo tema
      console.log('[updateSettings] Applying theme with color:', data.primaryColor);
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
      console.log('[uploadLogo] Starting upload for file:', file.name);
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

      console.log('[uploadLogo] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[uploadLogo] Error response:', errorData);
        throw new Error(errorData.message || 'Error al subir el logo');
      }

      const data = await response.json();
      console.log('[uploadLogo] Success response:', data);

      // Reload settings to get updated logo
      console.log('[uploadLogo] Reloading settings...');
      await useSettingsStore.getState().loadSettings();

      const currentSettings = useSettingsStore.getState().settings;
      console.log('[uploadLogo] Settings after reload:', currentSettings);

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
