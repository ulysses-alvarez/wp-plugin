import { useState } from 'react';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySidebar } from '@/components/properties/PropertySidebar';
import type { PropertyFormData } from '@/components/properties/PropertyForm';
import { usePropertyStore } from '@/stores/usePropertyStore';
import type { Property } from '@/utils/permissions';

export const PropertiesPage = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');

  const { createProperty, updateProperty, deleteProperty, loadProperties } = usePropertyStore();
  const loading = usePropertyStore(state => state.loading);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setSidebarMode('view');
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
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
    const { uploadFile } = await import('@/services/api');

    let attachmentId: number | undefined;
    if (data.attachment && data.attachment instanceof File) {
      try {
        const uploadResult = await uploadFile(data.attachment);
        attachmentId = uploadResult.id;
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    const propertyData = {
      ...data,
      attachment_id: attachmentId
    };

    delete (propertyData as any).attachment;

    if (sidebarMode === 'create') {
      const newProperty = await createProperty(propertyData as any);
      if (newProperty) {
        handleCloseSidebar();
        loadProperties();
      }
    } else if (sidebarMode === 'edit' && selectedProperty) {
      const updatedProperty = await updateProperty(selectedProperty.id, propertyData as any);
      if (updatedProperty) {
        handleCloseSidebar();
        loadProperties();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
          <div className="flex-shrink-0 mb-6">
            <PropertyFilters />
          </div>

          <div className="flex-1 overflow-hidden">
            <PropertyTable
              onPropertySelect={handlePropertySelect}
              onPropertyEdit={handleEdit}
              onPropertyDelete={handleDelete}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </div>

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
};
