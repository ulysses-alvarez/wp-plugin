import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProfileData {
  id: number;
  display_name: string;
  email: string;
  role: string;
  roleLabel: string;
}

interface ProfileFormData {
  display_name: string;
  email: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    display_name: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/wp-json/property-dashboard/v1/profile', {
        headers: {
          'X-WP-Nonce': window.wpPropertyDashboard?.nonce || '',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar perfil');
      }

      const data = await response.json();

      // Map API response to expected format (handle both name and display_name)
      const profileData = {
        id: data.id,
        display_name: data.display_name || data.name || '',
        email: data.email,
        role: data.role,
        roleLabel: data.roleLabel || data.role_label || '',
      };

      setProfile(profileData);
      setProfileForm({
        display_name: profileData.display_name,
        email: profileData.email,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!profileForm.display_name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!profileForm.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }

    try {
      setSaving(true);
      console.log('Updating profile with data:', profileForm); // Debug log

      const response = await fetch('/wp-json/property-dashboard/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpPropertyDashboard?.nonce || '',
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      console.log('Profile update response:', { status: response.status, data }); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      toast.success('Perfil actualizado exitosamente');

      // If API returns updated user data, use it instead of reloading
      if (data.user) {
        const profileData = {
          id: data.user.id,
          display_name: data.user.display_name || data.user.name || '',
          email: data.user.email,
          role: data.user.role,
          roleLabel: data.user.roleLabel || data.user.role_label || '',
        };
        setProfile(profileData);
        setProfileForm({
          display_name: profileData.display_name,
          email: profileData.email,
        });
      } else {
        // Fallback to reloading profile
        await loadProfile();
      }
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.current_password) {
      toast.error('La contraseña actual es requerida');
      return;
    }

    if (!passwordForm.new_password) {
      toast.error('La nueva contraseña es requerida');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);
      const requestData = {
        display_name: profileForm.display_name,
        email: profileForm.email,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      };
      console.log('Changing password with data:', requestData); // Debug log

      const response = await fetch('/wp-json/property-dashboard/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpPropertyDashboard?.nonce || '',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Password change response:', { status: response.status, data }); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      toast.success('Contraseña actualizada exitosamente');

      // Update profile data if returned by API
      if (data.user) {
        const profileData = {
          id: data.user.id,
          display_name: data.user.display_name || data.user.name || '',
          email: data.user.email,
          role: data.user.role,
          roleLabel: data.user.roleLabel || data.user.role_label || '',
        };
        setProfile(profileData);
        setProfileForm({
          display_name: profileData.display_name,
          email: profileData.email,
        });
      }

      // Clear password form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl">
        {/* Two column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Information Section */}
          <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
            <p className="text-sm text-gray-500 mt-1">Actualiza tu nombre y correo electrónico</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6">
            {profile && (
              <div className="mb-4 bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Rol:</span> {profile.roleLabel}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <Input
                  id="display_name"
                  type="text"
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico <span className="text-gray-500 font-normal text-xs">(solo lectura)</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  required
                  readOnly
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
            <p className="text-sm text-gray-500 mt-1">Actualiza tu contraseña de acceso</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña Actual
                </label>
                <PasswordInput
                  id="current_password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <PasswordInput
                  id="new_password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="••••••••"
                  helperText="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <PasswordInput
                  id="confirm_password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={saving} variant="secondary">
                {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};
