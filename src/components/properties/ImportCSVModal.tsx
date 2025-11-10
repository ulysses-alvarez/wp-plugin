/**
 * ImportCSVModal Component
 * Modal for importing properties from CSV file with progress tracking
 */

import { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type ImportState = 'selecting' | 'importing' | 'completed' | 'cancelled';

export interface ImportError {
  row: number;
  title: string;
  field: string;
  value: string;
  error: string;
  type: 'validation' | 'api' | 'duplicate';
}

export interface ImportProgress {
  current: number;
  total: number;
  success: number;
  errors: ImportError[];
}

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    file: File,
    onProgress: (progress: ImportProgress) => void,
    signal: AbortSignal
  ) => Promise<{ success: number; errors: ImportError[] }>;
}

export const ImportCSVModal = ({ isOpen, onClose, onImport }: ImportCSVModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [state, setState] = useState<ImportState>('selecting');
  const [progress, setProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    success: 0,
    errors: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Por favor selecciona un archivo CSV válido');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setState('importing');
    setProgress({ current: 0, total: 0, success: 0, errors: [] });
    abortControllerRef.current = new AbortController();

    try {
      const results = await onImport(
        selectedFile,
        (progressData) => {
          setProgress(progressData);
        },
        abortControllerRef.current.signal
      );

      setProgress((prev) => ({
        ...prev,
        success: results.success,
        errors: results.errors
      }));

      setState('completed');
    } catch (error: any) {
      console.error('Error importing CSV:', error);
      alert(error.message || 'Error al importar el archivo CSV');
      setState('selecting');
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState('cancelled');
    }
  };

  const handleClose = () => {
    if (state === 'importing') return; // No cerrar durante importación

    setSelectedFile(null);
    setState('selecting');
    setProgress({ current: 0, total: 0, success: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleDownloadTemplate = () => {
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
      'Jalisco', // Puede usar "Jalisco" o "jalisco"
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
  };

  const handleDownloadErrors = () => {
    if (progress.errors.length === 0) return;

    const headers = ['Fila', 'Título', 'Campo', 'Valor', 'Error', 'Tipo'];
    const rows = progress.errors.map(err => [
      err.row,
      err.title,
      err.field,
      err.value,
      err.error,
      err.type
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'errores_importacion.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={state === 'importing' ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {state === 'selecting' && 'Importar Propiedades desde CSV'}
            {state === 'importing' && 'Importando Propiedades...'}
            {state === 'completed' && 'Importación Completada'}
            {state === 'cancelled' && 'Importación Cancelada'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            disabled={state === 'importing'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* STATE: SELECTING */}
          {state === 'selecting' && (
            <div className="space-y-4">
              {/* Info Alert */}
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Instrucciones:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Descarga la plantilla CSV para ver el formato requerido</li>
                    <li>Campos requeridos: title, status, state, municipality, patent</li>
                    <li>Status válidos: available, sold, rented, reserved</li>
                    <li>State: puedes usar el nombre completo (ej: "Jalisco", "Nuevo León")</li>
                    <li>Las propiedades con errores serán omitidas automáticamente</li>
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* STATE: IMPORTING */}
          {state === 'importing' && (() => {
            // Count unique properties with errors
            const uniqueErrorRows = new Set(progress.errors.map(e => e.row)).size;

            return (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      Procesando {progress.current} de {progress.total}...
                    </span>
                    <span className="font-semibold text-primary">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-green-700">Importadas</p>
                      <p className="text-lg font-bold text-green-900">{progress.success}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-red-700">Con errores</p>
                      <p className="text-lg font-bold text-red-900">{uniqueErrorRows}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Errors */}
                {progress.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">⚠️ Errores recientes:</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                      {progress.errors.slice(-5).reverse().map((error, index) => (
                        <div key={index} className="text-xs text-red-800">
                          • Fila {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* STATE: COMPLETED */}
          {state === 'completed' && (() => {
            // Count unique properties with errors
            const uniqueErrorRows = new Set(progress.errors.map(e => e.row)).size;

            return (
              <div className="space-y-4">
                {/* Summary */}
                <div className="text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Importación Finalizada
                  </h3>
                  <p className="text-sm text-gray-600">
                    {progress.success} {progress.success === 1 ? 'propiedad importada' : 'propiedades importadas'} exitosamente
                    {uniqueErrorRows > 0 && `, ${uniqueErrorRows} ${uniqueErrorRows === 1 ? 'omitida' : 'omitidas'} por errores`}
                  </p>
                </div>

              {/* Error Table */}
              {progress.errors.length > 0 && (() => {
                // Group errors by row number
                const errorsByRow = progress.errors.reduce((acc, error) => {
                  if (!acc[error.row]) {
                    acc[error.row] = {
                      row: error.row,
                      title: error.title,
                      errors: []
                    };
                  }
                  acc[error.row].errors.push({
                    field: error.field,
                    error: error.error
                  });
                  return acc;
                }, {} as Record<number, { row: number; title: string; errors: { field: string; error: string }[] }>);

                const groupedErrors = Object.values(errorsByRow);

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Propiedades con errores:</p>
                      <button
                        onClick={handleDownloadErrors}
                        className="text-xs text-primary hover:text-primary-hover flex items-center gap-1"
                      >
                        <Download size={12} />
                        Descargar reporte
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Fila</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Título</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Errores</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {groupedErrors.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900 align-top">{item.row}</td>
                              <td className="px-3 py-2 text-gray-900 truncate max-w-[150px] align-top">{item.title}</td>
                              <td className="px-3 py-2">
                                <ul className="space-y-1">
                                  {item.errors.map((err, errIdx) => (
                                    <li key={errIdx} className="text-red-700">
                                      • {err.error}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {state === 'selecting' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={16} />
                Importar
              </button>
            </>
          )}

          {state === 'importing' && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <X size={16} />
              Cancelar Importación
            </button>
          )}

          {state === 'completed' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </>
  );
};
