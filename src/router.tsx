import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PropertiesPage } from './pages/PropertiesPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { SettingsPage } from './pages/SettingsPage';

/**
 * Router configuration
 * Using HashRouter for WordPress compatibility (no server rewrites needed)
 */
export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/properties" replace />
      },
      {
        path: 'properties',
        element: <PropertiesPage />
      },
      {
        path: 'users',
        element: <ComingSoonPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
]);
