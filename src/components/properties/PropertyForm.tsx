/**
 * PropertyForm Component
 * Form for creating and editing properties
 */

import { useState, useEffect, forwardRef } from 'react';
import { Input, Select, Textarea, FileUpload } from '@/components/ui';
import { PROPERTY_STATUS_OPTIONS, MEXICAN_STATES } from '@/utils/constants';
import type { Property } from '@/utils/permissions';

interface PropertyFormProps {
  property?: Property | null;
  mode: 'create' | 'edit';
  onSubmit: (data: PropertyFormData) => void;
  loading?: boolean;
}

export interface PropertyFormData {
  title: string;
  status: string;
  state: string;
  municipality: string;
  neighborhood: string;
  postal_code: string;
  street: string;
  patent: string;
  price?: number | string;
  google_maps_url?: string;
  description?: string;
  attachment?: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export const PropertyForm = forwardRef<HTMLFormElement, PropertyFormProps>(({
  property,
  mode,
  onSubmit,
  loading = false
}, ref) => {
  // Form state
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    status: 'available',
    state: '',
    municipality: '',
    neighborhood: '',
    postal_code: '',
    street: '',
    patent: '',
    price: '',
    google_maps_url: '',
    description: '',
    attachment: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Load property data in edit mode
  useEffect(() => {
    if (mode === 'edit' && property) {
      setFormData({
        title: property.title || '',
        status: property.status || 'available',
        state: property.state || '',
        municipality: property.municipality || '',
        neighborhood: property.neighborhood || '',
        postal_code: property.postal_code || '',
        street: property.street || '',
        patent: property.patent || '',
        price: property.price || '',
        google_maps_url: property.google_maps_url || '',
        description: property.description || '',
        attachment: null
      });
    }
  }, [property, mode]);

  // Validation function
  const validateField = (name: string, value: any): string => {
    // Required fields
    const requiredFields = [
      'title',
      'status',
      'state',
      'municipality',
      'neighborhood',
      'postal_code',
      'street',
      'patent',
      'price'
    ];

    if (requiredFields.includes(name) && !value) {
      return 'Este campo es requerido';
    }

    // Specific validations
    switch (name) {
      case 'postal_code':
        if (value && !/^\d{5}$/.test(value)) {
          return 'El código postal debe tener 5 dígitos';
        }
        break;

      case 'price':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          return 'El precio debe ser un número positivo';
        }
        break;

      case 'google_maps_url':
        if (value && !isValidUrl(value)) {
          return 'Ingresa una URL válida';
        }
        break;

      case 'title':
        if (value && value.length > 255) {
          return 'El título no puede exceder 255 caracteres';
        }
        break;
    }

    return '';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof PropertyFormData]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur
  const handleBlur = (name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, formData[name as keyof PropertyFormData]);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle file upload
  const handleFileChange = (file: File | null) => {
    handleChange('attachment', file);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit data
    onSubmit(formData);
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Input
        label="Título de la Propiedad"
        name="title"
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        onBlur={() => handleBlur('title')}
        error={errors.title}
        required
        placeholder="Ej: Casa en venta Colonia Centro"
        disabled={loading}
      />

      {/* Status */}
      <Select
        label="Estado de la Propiedad"
        name="status"
        value={formData.status}
        onChange={(e) => handleChange('status', e.target.value)}
        onBlur={() => handleBlur('status')}
        error={errors.status}
        options={[...PROPERTY_STATUS_OPTIONS]}
        required
        disabled={loading}
      />

      {/* State */}
      <Select
        label="Estado"
        name="state"
        value={formData.state}
        onChange={(e) => handleChange('state', e.target.value)}
        onBlur={() => handleBlur('state')}
        error={errors.state}
        options={[
          { value: '', label: 'Selecciona un estado' },
          ...MEXICAN_STATES
        ]}
        required
        disabled={loading}
      />

      {/* Municipality */}
      <Input
        label="Municipio"
        name="municipality"
        value={formData.municipality}
        onChange={(e) => handleChange('municipality', e.target.value)}
        onBlur={() => handleBlur('municipality')}
        error={errors.municipality}
        required
        placeholder="Ej: Guadalajara"
        disabled={loading}
      />

      {/* Neighborhood */}
      <Input
        label="Colonia"
        name="neighborhood"
        value={formData.neighborhood}
        onChange={(e) => handleChange('neighborhood', e.target.value)}
        onBlur={() => handleBlur('neighborhood')}
        error={errors.neighborhood}
        required
        placeholder="Ej: Colonia Americana"
        disabled={loading}
      />

      {/* Street */}
      <Input
        label="Dirección"
        name="street"
        value={formData.street}
        onChange={(e) => handleChange('street', e.target.value)}
        onBlur={() => handleBlur('street')}
        error={errors.street}
        required
        placeholder="Ej: Av. Chapultepec #123"
        disabled={loading}
      />

      {/* Postal Code */}
      <Input
        label="Código Postal"
        name="postal_code"
        value={formData.postal_code}
        onChange={(e) => handleChange('postal_code', e.target.value)}
        onBlur={() => handleBlur('postal_code')}
        error={errors.postal_code}
        required
        placeholder="44100"
        maxLength={5}
        disabled={loading}
      />

      {/* Patent */}
      <Input
        label="Patente"
        name="patent"
        value={formData.patent}
        onChange={(e) => handleChange('patent', e.target.value.toUpperCase())}
        onBlur={() => handleBlur('patent')}
        error={errors.patent}
        required
        placeholder="Ej: ABC-123"
        disabled={loading}
        helperText="La patente se guardará en mayúsculas automáticamente"
      />

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>
      <h3 className="text-base font-medium text-gray-700 -mt-4">Información Adicional</h3>

      {/* Price */}
      <Input
        label="Precio"
        name="price"
        type="number"
        value={formData.price}
        onChange={(e) => handleChange('price', e.target.value)}
        onBlur={() => handleBlur('price')}
        error={errors.price}
        required
        placeholder="Ej: 2500000"
        min={0}
        disabled={loading}
      />

      {/* Google Maps URL */}
      <Input
        label="URL de Google Maps"
        name="google_maps_url"
        value={formData.google_maps_url}
        onChange={(e) => handleChange('google_maps_url', e.target.value)}
        onBlur={() => handleBlur('google_maps_url')}
        error={errors.google_maps_url}
        placeholder="https://maps.google.com/..."
        disabled={loading}
      />

      {/* Description */}
      <Textarea
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Describe las características de la propiedad..."
        rows={4}
        disabled={loading}
      />

      {/* File Upload */}
      <FileUpload
        label="Ficha Técnica"
        name="attachment"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        disabled={loading}
        helperText="PDF, PNG o JPG (max. 2MB)"
      />
    </form>
  );
});

PropertyForm.displayName = 'PropertyForm';
