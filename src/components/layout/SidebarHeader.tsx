import { useSettingsStore } from '../../stores/useSettingsStore';
import { X } from 'lucide-react';

interface SidebarHeaderProps {
  onClose?: () => void;
}

export const SidebarHeader = ({ onClose }: SidebarHeaderProps) => {
  const { settings } = useSettingsStore();

  // Display name: wpSiteName
  const displayName = settings?.wpSiteName || '';

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
      {settings?.logoUrl ? (
        /* Si hay logo, solo mostrar el logo (reemplaza todo) */
        <>
          <img
            src={settings.logoUrl}
            alt={displayName}
            className="h-10 w-auto max-w-full object-contain flex-1"
          />
          {/* Botón X - Solo en mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden flex-shrink-0 p-1.5 text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-hover rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
        </>
      ) : (
        /* Sin logo: mostrar inicial + nombre + X */
        <>
          {displayName && (
            <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {displayName && (
            <div className="flex-1 min-w-0">
              <h1 className="text-sidebar-text font-semibold text-base truncate">
                {displayName}
              </h1>
            </div>
          )}
          {/* Botón X - Solo en mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden flex-shrink-0 p-1.5 text-sidebar-text hover:text-sidebar-text-hover hover:bg-sidebar-hover rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
};
