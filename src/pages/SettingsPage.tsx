import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { settings, isLoading, updateSettings } = useSettingsStore();

  const [formData, setFormData] = useState({
    siteName: '',
    logoUrl: '',
    primaryColor: '#216121'
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || '',
        logoUrl: settings.logoUrl || '',
        primaryColor: settings.primaryColor || '#216121'
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar nombre del sitio
    if (formData.siteName.length < 3 || formData.siteName.length > 50) {
      toast.error('El nombre del sitio debe tener entre 3 y 50 caracteres');
      return;
    }

    // Validar color hex
    if (!/^#[0-9A-F]{6}$/i.test(formData.primaryColor)) {
      toast.error('El color debe estar en formato hexadecimal válido (ej: #216121)');
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, primaryColor: e.target.value }));
  };

  if (isLoading && !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Personaliza el aspecto de tu dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card de configuración general */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información General
            </h2>

            <div className="space-y-4">
              {/* Nombre del sitio */}
              <div>
                <label htmlFor="siteName" className="label">
                  Nombre del Sitio
                </label>
                <Input
                  id="siteName"
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Mi Dashboard de Propiedades"
                  required
                  minLength={3}
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Aparecerá en el header del sidebar
                </p>
              </div>

              {/* Logo URL */}
              <div>
                <label htmlFor="logoUrl" className="label">
                  URL del Logo
                </label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Imagen PNG, JPG o SVG. Si está vacío, se mostrará la inicial del nombre.
                </p>
              </div>

              {/* Preview del logo */}
              {formData.logoUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview del Logo:</p>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-12 w-12 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.siteName || 'Nombre del sitio'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card de personalización */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personalización
            </h2>

            <div className="space-y-4">
              {/* Color principal */}
              <div>
                <label htmlFor="primaryColor" className="label">
                  Color Principal
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={handleColorChange}
                    className="h-10 w-20 rounded cursor-pointer border border-gray-300"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#216121"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Color usado en botones, enlaces y elementos destacados
                </p>
              </div>

              {/* Preview del color */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    Botón de Ejemplo
                  </button>
                  <div className="flex gap-2">
                    <div
                      className="h-10 w-10 rounded"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <div
                      className="h-10 w-10 rounded"
                      style={{
                        backgroundColor: formData.primaryColor,
                        opacity: 0.7
                      }}
                    />
                    <div
                      className="h-10 w-10 rounded"
                      style={{
                        backgroundColor: formData.primaryColor,
                        opacity: 0.4
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (settings) {
                  setFormData({
                    siteName: settings.siteName || '',
                    logoUrl: settings.logoUrl || '',
                    primaryColor: settings.primaryColor || '#216121'
                  });
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Guardando...</span>
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
