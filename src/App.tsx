/**
 * Property Dashboard App
 * Main application component with routing
 */

import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';

// Declarar el tipo para los datos de WordPress
declare global {
  interface Window {
    wpPropertyDashboard?: {
      apiUrl: string;
      wpApiUrl: string;
      nonce: string;
      siteUrl: string;
      currentUser: {
        id: number;
        name: string;
        email: string;
        role: string;
        roleLabel: string;
        capabilities: Record<string, boolean>;
      };
      config: {
        perPage: number;
        view: string;
      };
      i18n: {
        dateFormat: string;
        timeFormat: string;
        locale: string;
        currency: string;
      };
    };
  }
}

function App() {
  // Check if WordPress data is available
  if (!window.wpPropertyDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-warning-light border-2 border-warning rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-8 h-8 text-warning-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-warning-dark">Advertencia</h2>
          </div>
          <p className="text-warning-dark">
            Los datos de WordPress no están disponibles. Verifica que estés usando el shortcode{' '}
            <code className="bg-warning text-warning-dark px-1 py-0.5 rounded font-mono text-sm">
              [property_dashboard]
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            background: '#fff',
            color: '#1e293b'
          },
          success: {
            style: {
              background: 'rgba(16, 185, 129, 0.3)',
              color: '#059669',
              fontSize: '14px',
              fontWeight: '500'
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '500'
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Router */}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
