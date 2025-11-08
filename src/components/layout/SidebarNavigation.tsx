import { Link, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';

const navItems = [
  {
    id: 'properties',
    label: 'Propiedades',
    icon: Home,
    path: '/properties'
  },
  {
    id: 'users',
    label: 'Usuario',
    icon: User,
    path: '/users'
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

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <ul className="space-y-1">
        {navItems.map((item) => {
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
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
