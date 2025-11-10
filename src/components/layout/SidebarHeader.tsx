import { useSettingsStore } from '../../stores/useSettingsStore';

export const SidebarHeader = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
      {settings?.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.siteName || 'Logo'}
          className="h-10 w-10 object-contain rounded"
        />
      ) : (
        <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-white font-bold text-xl">
          {settings?.siteName?.charAt(0)?.toUpperCase() || 'P'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-sidebar-text font-semibold text-base truncate">
          {settings?.siteName || 'Property Dashboard'}
        </h1>
      </div>
    </div>
  );
};
