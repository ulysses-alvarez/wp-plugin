import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adjustColor, getContrastTextColor } from '../services/themeService';
import type { PriceRoundingLevel } from '../types/settings';

export const SettingsPage = () => {
  const { settings, isLoading, updateSettings, uploadLogo, deleteLogo } = useSettingsStore();

  const [formData, setFormData] = useState({
    primaryColor: '#000000',
    priceRounding: [
      { threshold: 100000, multiplier: 10000 },
      { threshold: 1000000, multiplier: 50000 },
      { threshold: 5000000, multiplier: 100000 },
      { threshold: 999999999999, multiplier: 500000 }
    ] as PriceRoundingLevel[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        primaryColor: settings.primaryColor || '#000000',
        priceRounding: settings.priceRounding || [
          { threshold: 100000, multiplier: 10000 },
          { threshold: 1000000, multiplier: 50000 },
          { threshold: 5000000, multiplier: 100000 },
          { threshold: 999999999999, multiplier: 500000 }
        ]
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

  // Price Rounding Management
  const handleRoundingChange = (index: number, field: 'threshold' | 'multiplier', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) return;

    const newRounding = [...formData.priceRounding];
    newRounding[index] = { ...newRounding[index], [field]: numValue };
    setFormData(prev => ({ ...prev, priceRounding: newRounding }));
  };

  const addRoundingLevel = () => {
    const newLevel: PriceRoundingLevel = {
      threshold: 10000000,  // Default: 10M
      multiplier: 1000000   // Default: round to nearest 1M
    };
    setFormData(prev => ({
      ...prev,
      priceRounding: [...prev.priceRounding, newLevel]
    }));
  };

  const removeRoundingLevel = (index: number) => {
    if (formData.priceRounding.length <= 1) {
      toast.error('Debe haber al menos un nivel de redondeo');
      return;
    }
    const newRounding = formData.priceRounding.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, priceRounding: newRounding }));
  };

  const resetRoundingToDefaults = () => {
    setFormData(prev => ({
      ...prev,
      priceRounding: [
        { threshold: 100000, multiplier: 10000 },
        { threshold: 1000000, multiplier: 50000 },
        { threshold: 5000000, multiplier: 100000 },
        { threshold: 999999999999, multiplier: 500000 }
      ]
    }));
    toast.success('Niveles de redondeo restablecidos a valores por defecto');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${num / 1000000}M`;
    if (num >= 1000) return `${num / 1000}k`;
    return num.toString();
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

          {/* Card de redondeo de precios */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Redondeo de Precios
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configura cómo se redondean los rangos de precios en los filtros
                </p>
              </div>
              <button
                type="button"
                onClick={resetRoundingToDefaults}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Valores por defecto
              </button>
            </div>

            <div className="space-y-3">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-sm font-medium text-gray-700 pb-2 border-b">
                <div>Umbral (hasta)</div>
                <div>Redondear a múltiplo de</div>
                <div className="w-10"></div>
              </div>

              {/* Rounding levels */}
              {formData.priceRounding.map((level, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                  <div>
                    <Input
                      type="number"
                      value={level.threshold}
                      onChange={(e) => handleRoundingChange(index, 'threshold', e.target.value)}
                      min="1"
                      step="1000"
                      className="w-full"
                      placeholder="100000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${formatNumber(level.threshold)}
                    </p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={level.multiplier}
                      onChange={(e) => handleRoundingChange(index, 'multiplier', e.target.value)}
                      min="1"
                      step="1000"
                      className="w-full"
                      placeholder="10000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${formatNumber(level.multiplier)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRoundingLevel(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar nivel"
                    disabled={formData.priceRounding.length <= 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {/* Add level button */}
              <button
                type="button"
                onClick={addRoundingLevel}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-gray-50 rounded-lg transition-colors w-full justify-center border-2 border-dashed border-gray-300 hover:border-primary"
              >
                <Plus size={18} />
                <span>Agregar nivel de redondeo</span>
              </button>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Ejemplo:</strong> Si el umbral es $100,000 y el múltiplo es $10,000, entonces los precios menores a $100,000 se redondearán al múltiplo de $10,000 más cercano (ej: $47,500 → $50,000).
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
                    primaryColor: settings.primaryColor || '#000000',
                    priceRounding: settings.priceRounding || [
                      { threshold: 100000, multiplier: 10000 },
                      { threshold: 1000000, multiplier: 50000 },
                      { threshold: 5000000, multiplier: 100000 },
                      { threshold: 999999999999, multiplier: 500000 }
                    ]
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
