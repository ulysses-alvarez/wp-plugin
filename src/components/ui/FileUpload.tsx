/**
 * FileUpload Component
 * Drag and drop file upload with preview
 */

import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import clsx from 'clsx';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  currentFile?: string | null;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  currentFile,
  label = 'Subir archivo',
  helperText,
  error,
  className
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!acceptedTypes.includes(fileExtension)) {
        return `Tipo de archivo no permitido. Tipos aceptados: ${accept}`;
      }
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="label">{label}</label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={clsx(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary bg-primary-light'
            : error
            ? 'border-danger bg-danger-light'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Icon */}
        <svg
          className={clsx(
            'mx-auto h-12 w-12 mb-3',
            error ? 'text-danger' : 'text-gray-400'
          )}
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text */}
        <div>
          {selectedFileName ? (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedFileName}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-sm text-danger hover:underline"
              >
                Eliminar
              </button>
            </div>
          ) : currentFile ? (
            <div>
              <p className="text-sm text-gray-600 mb-1">Archivo actual:</p>
              <a
                href={currentFile}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver archivo
              </a>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-primary">Haz clic para subir</span>
                {' '}o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">
                {accept.replace(/\./g, '').toUpperCase()} (máx. {maxSizeMB}MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
