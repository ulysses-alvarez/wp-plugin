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
        `${wpData.wpApiUrl}/property-dashboard/v1/settings`,
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
        `${wpData.wpApiUrl}/property-dashboard/v1/settings`,
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
        throw new Error('Error al guardar configuración');
      }

      const data = await response.json();
      set({ settings: data, isLoading: false });

      // Aplicar nuevo tema
      applyTheme(data);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      });
    }
  }
}));
