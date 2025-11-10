/**
 * ImportCSVModal Component
 * Modal for importing properties from CSV file
 */

import { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export const ImportCSVModal = ({ isOpen, onClose, onImport }: ImportCSVModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Por favor selecciona un archivo CSV válido');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo CSV');
      return;
    }

    setIsUploading(true);
    try {
      await onImport(selectedFile);
      toast.success('Propiedades importadas exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Error al importar el archivo CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = [
      'title',
      'status',
      'state',
      'municipality',
      'neighborhood',
      'postal_code',
      'street',
      'patent',
      'price',
      'google_maps',
      'description'
    ];

    const exampleRow = [
      'Propiedad de Ejemplo',
      'available',
      'Jalisco',
      'Guadalajara',
      'Americana',
      '44160',
      'Av. Américas 1500',
      'PAT-001',
      '2500000',
      'https://maps.google.com/?q=20.6736,-103.3925',
      'Descripción de la propiedad de ejemplo'
    ];

    const csvContent = [
      headers.join(','),
      exampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_propiedades.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Plantilla CSV descargada');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Importar Propiedades desde CSV</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Info Alert */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instrucciones:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Descarga la plantilla CSV para ver el formato requerido</li>
                <li>Los campos requeridos son: title, status, state, municipality, patent</li>
                <li>El status debe ser: available, sold, rented o reserved</li>
                <li>El state debe ser un estado válido de México</li>
              </ul>
            </div>
          </div>

          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} />
            Descargar Plantilla CSV
          </button>

          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar archivo CSV
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">
                    Haz clic para seleccionar un archivo CSV
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    o arrastra y suelta aquí
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload size={16} />
                Importar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
