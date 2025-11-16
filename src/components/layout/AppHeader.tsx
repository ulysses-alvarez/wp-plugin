import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UserDropdown } from './UserDropdown';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/properties')) return 'Propiedades';
  if (pathname.startsWith('/users')) return 'Usuarios';
  if (pathname.startsWith('/profile')) return 'Perfil';
  if (pathname.startsWith('/settings')) return 'Configuración';
  return 'Dashboard';
};

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const AppHeader = ({ onToggleSidebar, isSidebarOpen }: AppHeaderProps) => {
  const location = useLocation();
  const wpData = window.wpPropertyDashboard;

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      {/* Header: [Hamburguesa] [Título] [Avatar] - Todo alineado center */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Botón Hamburguesa - Solo en mobile/tablet */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex-shrink-0 p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Título de Página */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {pageTitle}
          </h1>
        </div>

        {/* User Dropdown - Avatar + Menú */}
        {wpData?.currentUser && (
          <UserDropdown
            name={wpData.currentUser.name}
            firstName={wpData.currentUser.firstName}
            lastName={wpData.currentUser.lastName}
            role={wpData.currentUser.role}
            roleLabel={wpData.currentUser.roleLabel}
            email={wpData.currentUser.email}
          />
        )}
      </div>
    </header>
  );
};
