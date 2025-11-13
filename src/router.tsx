import { createHashRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { PropertiesPage } from './pages/PropertiesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

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
        element: <UsersPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
]);
