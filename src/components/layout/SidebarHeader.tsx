import { useSettingsStore } from '../../stores/useSettingsStore';

export const SidebarHeader = () => {
  const { settings } = useSettingsStore();

  // Display name: wpSiteName
  const displayName = settings?.wpSiteName || '';

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
      {settings?.logoUrl ? (
        /* Si hay logo, solo mostrar el logo (reemplaza todo) */
        <img
          src={settings.logoUrl}
          alt={displayName}
          className="h-10 w-auto max-w-full object-contain"
        />
      ) : (
        /* Sin logo: mostrar inicial + nombre */
        <>
          {displayName && (
            <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
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
        </>
      )}
    </div>
  );
};
