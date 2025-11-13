import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PropertyTable } from '@/components/properties/PropertyTable';
import { PropertyFilters } from '@/components/properties/PropertyFilters';
import { PropertySidebar } from '@/components/properties/PropertySidebar';
import { BulkActionsBar } from '@/components/properties/BulkActionsBar';
import { BulkDeleteModal } from '@/components/properties/BulkDeleteModal';
import { BulkStatusModal } from '@/components/properties/BulkStatusModal';
import { BulkPatentModal } from '@/components/properties/BulkPatentModal';
import { ImportCSVModal, type ImportError, type ImportProgress } from '@/components/properties/ImportCSVModal';
import { ExportModal } from '@/components/properties/ExportModal';
import type { PropertyFormData } from '@/components/properties/PropertyForm';
import { usePropertyStore } from '@/stores/usePropertyStore';
import type { Property } from '@/utils/permissions';
import type { PropertyStatus } from '@/types/bulk';
import { MEXICAN_STATES } from '@/utils/constants';
import toast from 'react-hot-toast';
import { Info } from 'lucide-react';

// Función para normalizar el nombre del estado al value esperado
const normalizeStateName = (stateName: string): string => {
  if (!stateName) return '';

  // Try to find exact match by label (case insensitive)
  const state = MEXICAN_STATES.find(
    s => s.label.toLowerCase() === stateName.toLowerCase().trim()
  );

  if (state) {
    return state.value;
  }

  // Try to find by value
  const stateByValue = MEXICAN_STATES.find(
    s => s.value.toLowerCase() === stateName.toLowerCase().trim()
  );

  if (stateByValue) {
    return stateByValue.value;
  }

  // Return original value if no match found
  return stateName.trim();
};

// Función de validación de propiedades
const validateProperty = (property: any, rowNumber: number): ImportError[] => {
  const errors: ImportError[] = [];
  const title = property.title?.trim() || '[sin título]';

  // Validar título (requerido)
  if (!property.title?.trim()) {
    errors.push({
      row: rowNumber,
      title,
      field: 'title',
      value: property.title || '',
      error: 'El título es obligatorio',
      type: 'validation'
    });
  }

  // Validar status (requerido y valores específicos)
  if (!property.status?.trim()) {
    errors.push({
      row: rowNumber,
      title,
      field: 'status',
      value: property.status || '',
      error: 'El status es obligatorio',
      type: 'validation'
    });
  } else if (!['available', 'sold', 'rented', 'reserved'].includes(property.status)) {
    errors.push({
      row: rowNumber,
      title,
      field: 'status',
      value: property.status,
      error: 'Status debe ser: available, sold, rented o reserved',
      type: 'validation'
    });
  }

  // Validar state (requerido)
  if (!property.state?.trim()) {
    errors.push({
      row: rowNumber,
      title,
      field: 'state',
      value: property.state || '',
      error: 'El estado es obligatorio',
      type: 'validation'
    });
  }

  // Validar municipality (requerido)
  if (!property.municipality?.trim()) {
    errors.push({
      row: rowNumber,
      title,
      field: 'municipality',
      value: property.municipality || '',
      error: 'El municipio es obligatorio',
      type: 'validation'
    });
  }

  // Validar patent (requerido)
  if (!property.patent?.trim()) {
    errors.push({
      row: rowNumber,
      title,
      field: 'patent',
      value: property.patent || '',
      error: 'La patente es obligatoria',
      type: 'validation'
    });
  }

  // Validar price (opcional pero debe ser número)
  if (property.price && property.price.trim() && isNaN(Number(property.price))) {
    errors.push({
      row: rowNumber,
      title,
      field: 'price',
      value: property.price,
      error: 'El precio debe ser un número válido',
      type: 'validation'
    });
  }

  // Validar postal_code (opcional pero debe tener 5 dígitos)
  if (property.postal_code && property.postal_code.trim() && !/^\d{5}$/.test(property.postal_code)) {
    errors.push({
      row: rowNumber,
      title,
      field: 'postal_code',
      value: property.postal_code,
      error: 'El código postal debe tener 5 dígitos',
      type: 'validation'
    });
  }

  // Validar google_maps (opcional pero debe ser URL)
  if (property.google_maps && property.google_maps.trim() && !property.google_maps.startsWith('http')) {
    errors.push({
      row: rowNumber,
      title,
      field: 'google_maps',
      value: property.google_maps,
      error: 'La URL debe comenzar con http:// o https://',
      type: 'validation'
    });
  }

  return errors;
};

export const PropertiesPage = () => {
  const location = useLocation();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Bulk actions state
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkPatentModalOpen, setIsBulkPatentModalOpen] = useState(false);

  // Use specific selectors to avoid infinite loops
  const createProperty = usePropertyStore(state => state.createProperty);
  const updateProperty = usePropertyStore(state => state.updateProperty);
  const deleteProperty = usePropertyStore(state => state.deleteProperty);
  const bulkDeleteProperties = usePropertyStore(state => state.bulkDeleteProperties);
  const bulkUpdateStatus = usePropertyStore(state => state.bulkUpdateStatus);
  const bulkUpdatePatent = usePropertyStore(state => state.bulkUpdatePatent);
  const loadProperties = usePropertyStore(state => state.loadProperties);
  const setPage = usePropertyStore(state => state.setPage);
  const loading = usePropertyStore(state => state.loading);

  // Close all modals when component unmounts or route changes
  useEffect(() => {
    return () => {
      setIsSidebarOpen(false);
      setIsBulkDeleteModalOpen(false);
      setIsBulkStatusModalOpen(false);
      setIsBulkPatentModalOpen(false);
      setIsImportModalOpen(false);
      setIsExportModalOpen(false);
      setSelectedProperty(null);
      setSelectedProperties([]);
      setSelectedIds(new Set());
    };
  }, [location.pathname]);

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
        // Upload error handled silently
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
    setIsExportModalOpen(true);
  };

  const handleBulkExport = () => {
    setIsExportModalOpen(true);
  };

  // Bulk actions handlers
  const handleSelectionChange = (ids: Set<number>, properties: Property[]) => {
    setSelectedIds(ids);
    setSelectedProperties(properties);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = async (propertyIds: number[]) => {
    // Clear selections FIRST (before loadProperties re-renders)
    handleDeselectAll();

    await bulkDeleteProperties(propertyIds);
    // Reload properties from server to reflect changes and get remaining properties
    await loadProperties();

    // Fix pagination: if current page is empty but there are previous pages, go to last valid page
    const state = usePropertyStore.getState();
    if (state.properties.length === 0 && state.currentPage > 1 && state.totalPages > 0) {
      // Go to the last valid page
      setPage(state.totalPages);
      await loadProperties();
    }
    // Note: Modal closes via onClose() after this completes
  };

  const handleBulkStatusChange = () => {
    setIsBulkStatusModalOpen(true);
  };

  const handleBulkStatusConfirm = async (propertyIds: number[], status: PropertyStatus) => {
    // Clear selections FIRST (before loadProperties re-renders)
    handleDeselectAll();

    await bulkUpdateStatus(propertyIds, status);
    // Reload properties from server to ensure changes are persisted
    await loadProperties();

    // Fix pagination: if current page is empty but there are previous pages, go to last valid page
    const state = usePropertyStore.getState();
    if (state.properties.length === 0 && state.currentPage > 1 && state.totalPages > 0) {
      setPage(state.totalPages);
      await loadProperties();
    }
    // Note: Modal closes via onClose() after this completes
  };

  const handleBulkPatentChange = () => {
    setIsBulkPatentModalOpen(true);
  };

  const handleBulkPatentConfirm = async (propertyIds: number[], patent: string) => {
    // Clear selections FIRST (before bulkUpdatePatent calls loadProperties internally)
    handleDeselectAll();

    await bulkUpdatePatent(propertyIds, patent);
    // Note: bulkUpdatePatent already calls loadProperties() internally

    // Fix pagination: if current page is empty but there are previous pages, go to last valid page
    const state = usePropertyStore.getState();
    if (state.properties.length === 0 && state.currentPage > 1 && state.totalPages > 0) {
      setPage(state.totalPages);
      await loadProperties();
    }
    // Modal closes via onClose() after this completes
  };

  const handleBulkDownloadSheets = async () => {
    try {
      const { bulkDownloadSheets } = await import('@/services/api');
      // Save property IDs before clearing selections
      const propertyIds = Array.from(selectedIds);

      // Clear selections FIRST (before any operations)
      handleDeselectAll();

      toast.loading('Preparando descarga...');

      const result = await bulkDownloadSheets(propertyIds);

      toast.dismiss();

      if (result.success && result.download_url && result.filename) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = result.download_url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show appropriate message
        if (result.single_file) {
          toast.success(`Descargando ficha técnica`);
        } else {
          if (result.files_without_attachment > 0) {
            toast.success(`${result.files_count} fichas descargadas en ZIP. ${result.files_without_attachment} propiedades sin ficha.`, {
              duration: 5000
            });
          } else {
            toast.success(`${result.files_count} fichas descargadas en ZIP`);
          }
        }
      } else {
        // success=false means no attachments available (not an error)
        // Backend now returns { success: false, message: '...' } instead of throwing 404
        const message = result.message || 'Ninguna propiedad tiene ficha técnica adjunta';
        toast(message, {
          icon: <Info className="w-5 h-5 text-white" />,
          duration: 4000,
          style: {
            background: '#2753b3', // Azul info personalizado
            color: '#ffffff',
          }
        });
      }
    } catch (error) {
      toast.dismiss();
      // Only real errors will reach here now
      toast.error(error instanceof Error ? error.message : 'Error al descargar fichas');
    }
  };

  const handleDeselectAll = () => {
    // Clear session storage FIRST
    sessionStorage.removeItem('propertySelection');

    // Update local state immediately
    setSelectedIds(new Set());
    setSelectedProperties([]);

    // Close all bulk action modals
    setIsBulkDeleteModalOpen(false);
    setIsBulkStatusModalOpen(false);
    setIsBulkPatentModalOpen(false);
  };

  // Helper function to parse CSV line respecting quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  };

  const handleImportCSV = async (
    file: File,
    onProgress: (progress: ImportProgress) => void,
    signal: AbortSignal
  ): Promise<{ success: number; errors: ImportError[] }> => {
    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene datos');
    }

    // Parse headers using robust parser
    const headers = parseCSVLine(lines[0]);
    const properties: any[] = [];

    // Parse all rows into property objects
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const property: any = {};

      headers.forEach((header, index) => {
        property[header] = values[index] || '';
      });

      // Normalize state name from label to value (e.g., "Jalisco" -> "jalisco")
      if (property.state) {
        property.state = normalizeStateName(property.state);
      }

      properties.push(property);
    }

    // Import each property with validation and progress tracking
    let successCount = 0;
    const allErrors: ImportError[] = [];
    const total = properties.length;

    for (let i = 0; i < properties.length; i++) {
      // Check if import was cancelled
      if (signal.aborted) {
        break;
      }

      const propertyData = properties[i];
      const rowNumber = i + 2; // +2 because: +1 for array index, +1 for header row

      // Validate property
      const validationErrors = validateProperty(propertyData, rowNumber);

      if (validationErrors.length > 0) {
        // Property has validation errors, skip it
        allErrors.push(...validationErrors);
      } else {
        // Property is valid, attempt to import
        try {
          await createProperty(propertyData, true); // silent = true for bulk import
          successCount++;
        } catch (error: any) {
          // API error during import
          const title = propertyData.title?.trim() || '[sin título]';
          allErrors.push({
            row: rowNumber,
            title,
            field: 'general',
            value: '',
            error: error.message || 'Error al importar la propiedad',
            type: 'api'
          });
        }
      }

      // Report progress after each row
      onProgress({
        current: i + 1,
        total,
        success: successCount,
        errors: allErrors
      });
    }

    // Reload properties if any were imported successfully
    if (successCount > 0) {
      loadProperties();
    }

    // Count unique properties with errors (group by row)
    const uniqueErrorRows = new Set(allErrors.map(e => e.row)).size;

    // Show summary toast
    if (successCount > 0 && uniqueErrorRows === 0) {
      toast.success(`${successCount} ${successCount === 1 ? 'propiedad importada' : 'propiedades importadas'} exitosamente`);
    } else if (successCount > 0 && uniqueErrorRows > 0) {
      toast.success(`${successCount} importadas, ${uniqueErrorRows} ${uniqueErrorRows === 1 ? 'omitida' : 'omitidas'} por errores`);
    } else if (uniqueErrorRows > 0) {
      toast.error(`${uniqueErrorRows} ${uniqueErrorRows === 1 ? 'propiedad omitida' : 'propiedades omitidas'} por errores`);
    }

    return {
      success: successCount,
      errors: allErrors
    };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filters - Fixed at top */}
      <div className="flex-shrink-0">
        <PropertyFilters
          onCreateNew={handleCreateNew}
          onExport={handleExport}
          onImport={() => setIsImportModalOpen(true)}
        />
      </div>

      {/* Table Container - Scrollable content with fixed footer */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="sm:px-6 lg:px-8 pt-6 h-full flex flex-col">
          <PropertyTable
            onPropertySelect={handlePropertySelect}
            onPropertyEdit={handleEdit}
            onPropertyDelete={handleDelete}
            onCreateNew={handleCreateNew}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        selectedProperties={selectedProperties}
        onDeselectAll={handleDeselectAll}
        onDelete={handleBulkDelete}
        onStatusChange={handleBulkStatusChange}
        onPatentChange={handleBulkPatentChange}
        onDownloadSheets={handleBulkDownloadSheets}
        onExport={handleBulkExport}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        properties={selectedProperties}
        onClose={() => {
          setIsBulkDeleteModalOpen(false);
          handleDeselectAll();
        }}
        onConfirm={handleBulkDeleteConfirm}
      />

      {/* Bulk Status Modal */}
      <BulkStatusModal
        isOpen={isBulkStatusModalOpen}
        properties={selectedProperties}
        onClose={() => {
          setIsBulkStatusModalOpen(false);
          handleDeselectAll();
        }}
        onConfirm={handleBulkStatusConfirm}
      />

      {/* Bulk Patent Modal */}
      <BulkPatentModal
        isOpen={isBulkPatentModalOpen}
        properties={selectedProperties}
        onClose={() => {
          setIsBulkPatentModalOpen(false);
          handleDeselectAll();
        }}
        onConfirm={handleBulkPatentConfirm}
      />

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

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedProperties={selectedProperties.length > 0 ? selectedProperties : undefined}
        onExportComplete={handleDeselectAll}
      />
    </div>
  );
};
