import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { applyTheme } from '../../services/themeService';
import type { SiteConfig } from '../../types/settings';

// Aplicar tema desde localStorage inmediatamente (antes del primer render)
const cachedTheme = localStorage.getItem('property_dashboard_theme');
if (cachedTheme) {
  try {
    const settings: SiteConfig = JSON.parse(cachedTheme);
    applyTheme(settings);
  } catch (error) {
    console.error('Error al aplicar tema desde cache:', error);
  }
}

export const AppLayout = () => {
  const { loadSettings } = useSettingsStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cargar configuración al montar (actualiza desde API)
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AppSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
