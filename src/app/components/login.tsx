import { useState } from 'react';
import { Mail, Lock, IceCream } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Ingrese un correo válido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data && (data.message || data.error)) || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      const token = data?.access_token ?? data?.token ?? data?.jwt ?? data?.accessToken;
      const user = data?.detail ?? data?.user ?? null;

      if (!token) {
        setError('No se recibió token del servidor');
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No se recibió información del usuario');
        setLoading(false);
        return;
      }

      localStorage.setItem('jwt', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userSession', JSON.stringify(user));
      try {
        localStorage.setItem('turnoAbierto', JSON.stringify(Boolean(user.shift)));
      } catch {}
      if (user.base !== undefined && user.base !== null) {
        localStorage.setItem('baseCaja', String(user.base));
      }

      onLogin(email);
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <IceCream className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">Heladería POS</h1>
          <p className="text-gray-600">Ingrese sus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium ${loading ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
