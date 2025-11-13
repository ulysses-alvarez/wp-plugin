import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { canManageUsers } from '../../utils/permissions';

interface SidebarFooterProps {
  onLinkClick?: () => void;
}

export const SidebarFooter = ({ onLinkClick }: SidebarFooterProps) => {
  const location = useLocation();
  const isActive = location.pathname === '/settings';

  // Only show settings to users with manage_dashboard_users capability (property_admin)
  if (!canManageUsers()) {
    return null;
  }

  return (
    <div className="border-t border-sidebar-border p-3">
      <Link
        to="/settings"
        onClick={onLinkClick}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-colors duration-150 font-medium text-sm
          ${
            isActive
              ? 'bg-primary text-white'
              : 'text-sidebar-text hover:bg-sidebar-hover'
          }
        `}
      >
        <Settings size={20} className="flex-shrink-0" />
        <span>Configuración</span>
      </Link>
    </div>
  );
};
