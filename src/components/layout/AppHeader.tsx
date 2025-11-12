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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 lg:pl-6 pl-16">
      {/* Layout adaptativo: stack en móvil, fila en desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Ruta Actual - con truncate para evitar desbordamiento */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Usuario Info - completo en todas las pantallas */}
        {wpData?.currentUser && (
          <div className="flex items-center gap-3 flex-shrink-0">
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
      </div>
    </header>
  );
};
