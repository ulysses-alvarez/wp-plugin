import { Plus } from 'lucide-react';
import { UserTable } from '../components/users/UserTable';

export default function UsersPage() {
  const handleAddUser = () => {
    // Construct admin URL from site URL
    const siteUrl = window.wpPropertyDashboard?.siteUrl || '';
    const adminUrl = siteUrl ? `${siteUrl}/wp-admin` : '/wp-admin';
    window.open(`${adminUrl}/user-new.php`, '_blank', 'noopener,noreferrer');
  };

  const handleEditUser = (userId: number) => {
    // Construct admin URL from site URL
    const siteUrl = window.wpPropertyDashboard?.siteUrl || '';
    const adminUrl = siteUrl ? `${siteUrl}/wp-admin` : '/wp-admin';
    window.open(`${adminUrl}/user-edit.php?user_id=${userId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header con botón Agregar - Fixed at top */}
      <div className="flex-shrink-0">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - Scrollable content with fixed footer */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="sm:px-6 lg:px-8 pt-6 h-full flex flex-col">
          <UserTable onEditUser={handleEditUser} />
        </div>
      </div>
    </div>
  );
}
