import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('log', username);
      formData.append('pwd', password);
      formData.append('rememberme', rememberMe ? 'forever' : '');
      formData.append('wp-submit', 'Log In');
      formData.append('redirect_to', window.location.origin + '/dashboard/#/properties');

      const response = await fetch('/wp-login.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });

      if (response.redirected || response.ok) {
        window.location.href = '/dashboard/#/properties';
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Property Manager</h1>
            <p className="text-sm text-gray-600 mt-2">Sistema de gestión de propiedades</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username/Email Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Correo Electrónico
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continuar con</span>
            </div>
          </div>

          {/* Google Login */}
          <div
            className="flex justify-center"
            dangerouslySetInnerHTML={{
              __html: '[nextend_social_login provider="google" style="icon" redirect="/dashboard/#/properties"]'
            }}
          />

          {/* Lost Password Link */}
          <div className="mt-6 text-center">
            <a
              href="/wp-login.php?action=lostpassword"
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Property Manager. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};
