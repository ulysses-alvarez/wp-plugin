import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSidebar = ({ isOpen, onClose }: AppSidebarProps) => {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-sidebar flex flex-col h-screen z-40 border-r border-sidebar-border
          fixed inset-y-0 left-0 w-[260px]
          lg:static lg:w-[260px] lg:flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarHeader onClose={onClose} />
        <SidebarNavigation onLinkClick={onClose} />
        <SidebarFooter onLinkClick={onClose} />
      </aside>
    </>
  );
};
