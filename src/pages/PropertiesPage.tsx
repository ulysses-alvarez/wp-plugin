import { useState } from 'react';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySidebar } from '@/components/properties/PropertySidebar';
import { ImportCSVModal } from '@/components/properties/ImportCSVModal';
import type { PropertyFormData } from '@/components/properties/PropertyForm';
import { usePropertyStore } from '@/stores/usePropertyStore';
import type { Property } from '@/utils/permissions';
import toast from 'react-hot-toast';

export const PropertiesPage = () => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportar propiedades');
  };

  const handleImportCSV = async (file: File) => {
    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene datos');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const properties = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const property: any = {};

      headers.forEach((header, index) => {
        property[header] = values[index] || '';
      });

      properties.push(property);
    }

    // Import each property
    let successCount = 0;
    let errorCount = 0;

    for (const propertyData of properties) {
      try {
        await createProperty(propertyData);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('Error importing property:', error);
      }
    }

    if (successCount > 0) {
      loadProperties();
      toast.success(`${successCount} ${successCount === 1 ? 'propiedad importada' : 'propiedades importadas'} exitosamente`);
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} ${errorCount === 1 ? 'propiedad falló' : 'propiedades fallaron'} al importar`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PropertyFilters
        onCreateNew={handleCreateNew}
        onExport={handleExport}
        onImport={() => setIsImportModalOpen(true)}
      />

      <div className="flex-1 overflow-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-6 h-full flex flex-col">
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

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportCSV}
      />
    </div>
  );
};
