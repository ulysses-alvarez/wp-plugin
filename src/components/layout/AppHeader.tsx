import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/properties')) return 'Propiedades';
  if (pathname.startsWith('/users')) return 'Usuarios';
  if (pathname.startsWith('/settings')) return 'Configuración';
  return 'Dashboard';
};

export const AppHeader = () => {
  const location = useLocation();
  const wpData = window.wpPropertyDashboard;

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Ruta Actual */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Usuario Info */}
      {wpData?.currentUser && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {wpData.currentUser.name}
            </div>
            <div className="text-xs text-gray-500">
              {wpData.currentUser.roleLabel || wpData.currentUser.role}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {wpData.currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
};
