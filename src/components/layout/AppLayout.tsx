import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useEffect } from 'react';
import { useSettingsStore } from '../../stores/useSettingsStore';

export const AppLayout = () => {
  const { loadSettings } = useSettingsStore();

  // Cargar configuración al montar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
