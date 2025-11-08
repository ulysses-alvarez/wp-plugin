import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface SidebarFooterProps {
  onLinkClick?: () => void;
}

export const SidebarFooter = ({ onLinkClick }: SidebarFooterProps) => {
  const location = useLocation();
  const isActive = location.pathname === '/settings';

  return (
    <div className="border-t border-gray-700 p-3">
      <Link
        to="/settings"
        onClick={onLinkClick}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-colors duration-150 font-medium text-sm
          ${
            isActive
              ? 'bg-primary text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }
        `}
      >
        <Settings size={20} className="flex-shrink-0" />
        <span>Configuración</span>
      </Link>
    </div>
  );
};
