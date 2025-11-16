import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings } from 'lucide-react';
import { canManageUsers, can } from '../../utils/permissions';

const navItems = [
  {
    id: 'properties',
    label: 'Propiedades',
    icon: Home,
    path: '/properties',
    requiresCapability: null, // Always visible
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: User,
    path: '/users',
    requiresCapability: 'manage_dashboard_users',
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    path: '/settings',
    requiresCapability: 'manage_options',
  }
];

interface SidebarNavigationProps {
  onLinkClick?: () => void;
}

export const SidebarNavigation = ({ onLinkClick }: SidebarNavigationProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Filter nav items based on user capabilities
  const visibleNavItems = navItems.filter((item) => {
    if (!item.requiresCapability) return true;
    if (item.requiresCapability === 'manage_dashboard_users') {
      return canManageUsers();
    }
    if (item.requiresCapability === 'manage_options') {
      return can('manage_options');
    }
    return false;
  });

  return (
    <nav id="sidebar-navigation" className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Navegación principal">
      <ul className="space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={onLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-150 font-medium text-sm
                  ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-sidebar-text hover:bg-sidebar-hover'
                  }
                `}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
