import { useState } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarFooter } from './SidebarFooter';
import { X, Menu } from 'lucide-react';

export const AppSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white p-2 rounded-lg shadow-lg hover:bg-primary-hover transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-[260px] flex-shrink-0 bg-[#1e293b] flex flex-col h-screen sticky top-0 z-40
          fixed lg:static inset-y-0 left-0
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: 'var(--color-sidebar-bg)' }}
      >
        <SidebarHeader />
        <SidebarNavigation onLinkClick={() => setIsMobileOpen(false)} />
        <SidebarFooter onLinkClick={() => setIsMobileOpen(false)} />
      </aside>
    </>
  );
};
