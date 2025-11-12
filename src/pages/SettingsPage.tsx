import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adjustColor, getContrastTextColor } from '../services/themeService';

export const SettingsPage = () => {
  const { settings, isLoading, updateSettings, uploadLogo, deleteLogo } = useSettingsStore();

  const [formData, setFormData] = useState({
    primaryColor: '#000000'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        primaryColor: settings.primaryColor || '#000000'
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar color hex
    if (!/^#[0-9A-F]{6}$/i.test(formData.primaryColor)) {
      toast.error('El color debe estar en formato hexadecimal válido (ej: #000000)');
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, SVG, WEBP)');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. El tamaño máximo es 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      await uploadLogo(file);
      toast.success('Logo subido correctamente');
    } catch (error) {
      toast.error('Error al subir el logo');
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar el logo?')) return;

    try {
      await deleteLogo();
      toast.success('Logo eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el logo');
    }
  };

  if (isLoading && !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600 mt-1">
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
              {/* Subir Logo */}
              <div>
                <label className="label">
                  Logo
                </label>

                {/* Preview del logo actual */}
                {settings?.logoUrl && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={settings.logoUrl}
                          alt="Logo actual"
                          className="h-12 w-12 object-contain rounded"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                          Logo actual
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogoDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar logo"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón para subir logo */}
                <div className="relative">
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploadingLogo}
                  />
                  <label
                    htmlFor="logoUpload"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors ${
                      isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploadingLogo ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-gray-600">Subiendo logo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {settings?.logoUrl ? 'Cambiar logo' : 'Haz clic para subir un logo'}
                        </span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Imagen JPG, PNG, GIF, SVG o WEBP (máx. 2MB).
                </p>
              </div>
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
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, primaryColor: '#000000' }))}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                    title="Resetear al color por defecto"
                  >
                    Resetear
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Color usado en botones, enlaces y elementos destacados
                </p>
              </div>

              {/* Preview del color con variantes reales */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Preview de colores:</p>
                <div className="flex gap-3">
                  {/* Color Principal */}
                  <div className="flex-1">
                    <div
                      className="h-20 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm border border-gray-200"
                      style={{
                        backgroundColor: formData.primaryColor,
                        color: getContrastTextColor(formData.primaryColor)
                      }}
                    >
                      <span className="text-xs font-semibold">Primary</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {formData.primaryColor}
                      </span>
                    </div>
                  </div>

                  {/* Color Hover */}
                  <div className="flex-1">
                    <div
                      className="h-20 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm border border-gray-200"
                      style={{
                        backgroundColor: adjustColor(formData.primaryColor, -20),
                        color: getContrastTextColor(adjustColor(formData.primaryColor, -20))
                      }}
                    >
                      <span className="text-xs font-semibold">Hover</span>
                      <span className="text-[10px] font-mono opacity-80">
                        -20% brillo
                      </span>
                    </div>
                  </div>

                  {/* Color Light */}
                  <div className="flex-1">
                    <div
                      className="h-20 rounded-lg flex flex-col items-center justify-center gap-1 shadow-sm border border-gray-200"
                      style={{
                        backgroundColor: adjustColor(formData.primaryColor, 97),
                        color: getContrastTextColor(adjustColor(formData.primaryColor, 97))
                      }}
                    >
                      <span className="text-xs font-semibold">Light</span>
                      <span className="text-[10px] font-mono opacity-80">
                        +97% brillo
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Los textos se ajustan automáticamente para mantener el contraste
                </p>
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
                    primaryColor: settings.primaryColor || '#000000'
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
