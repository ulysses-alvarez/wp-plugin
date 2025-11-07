/**
 * Property Dashboard App
 * Main application component
 */

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySidebar } from '@/components/properties/PropertySidebar';
import type { PropertyFormData } from '@/components/properties/PropertyForm';
import { usePropertyStore } from '@/stores/usePropertyStore';
import type { Property } from '@/utils/permissions';
import { getUserCapabilitiesSummary } from '@/utils/permissions';

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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');

  // Access store functions
  const { createProperty, updateProperty, deleteProperty, loadProperties } = usePropertyStore();
  const loading = usePropertyStore(state => state.loading);

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

  const userCapabilities = getUserCapabilitiesSummary();

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Wait for animation to complete before clearing selection
    setTimeout(() => {
      setSelectedProperty(null);
      setSidebarMode('view');
    }, 300);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setSidebarMode('edit');
    setIsSidebarOpen(true);
  };

  const handleDelete = async (property: Property) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la propiedad "${property.title}"?`)) {
      const success = await deleteProperty(property.id);
      if (success) {
        handleCloseSidebar();
        // Reload properties
        loadProperties();
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedProperty(null);
    setSidebarMode('create');
    setIsSidebarOpen(true);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    if (sidebarMode === 'create') {
      const newProperty = await createProperty(data as any);
      if (newProperty) {
        handleCloseSidebar();
        // Reload properties
        loadProperties();
      }
    } else if (sidebarMode === 'edit' && selectedProperty) {
      const updatedProperty = await updateProperty(selectedProperty.id, data as any);
      if (updatedProperty) {
        handleCloseSidebar();
        // Reload properties
        loadProperties();
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />

      {/* Header - Fixed height */}
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Dashboard de Propiedades
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {window.wpPropertyDashboard.currentUser.name} · {userCapabilities.roleLabel}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {userCapabilities.roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flexible with internal scroll */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
          {/* Filters */}
          <div className="flex-shrink-0 mb-6">
            <PropertyFilters />
          </div>

          {/* Property Table - Flexible with internal scroll */}
          <div className="flex-1 overflow-hidden">
            <PropertyTable
              onPropertySelect={handlePropertySelect}
              onPropertyEdit={handleEdit}
              onPropertyDelete={handleDelete}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </main>

      {/* Property Sidebar */}
      <PropertySidebar
        property={selectedProperty}
        isOpen={isSidebarOpen}
        mode={sidebarMode}
        onClose={handleCloseSidebar}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmit={handleFormSubmit}
        loading={loading}
      />
    </div>
  );
}

export default App;
