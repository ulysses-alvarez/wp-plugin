import { useState, useEffect } from 'react';
import { ExternalLink, UserPlus } from 'lucide-react';
import { userService } from '../services/userService';
import type { User } from '../types/user.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar usuarios. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando usuarios..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <Button onClick={loadUsers} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-end items-center mb-6">
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <UserPlus size={18} />
          Agregar Usuario
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No hay usuarios para mostrar
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    {(user.first_name || user.last_name) && (
                      <div className="text-sm text-gray-500">
                        {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role_label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.registered).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                    >
                      Editar
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      {users.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total: {users.length} usuario{users.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
