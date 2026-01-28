import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Login } from '@/app/components/login';
import { Sidebar } from '@/app/components/sidebar';
import { Turno } from '@/app/components/turno';
import { Venta } from '@/app/components/venta';
import { Productos } from '@/app/components/productos';
import { useIsMobile } from '@/app/hooks/useIsMobile';

type Module = 'turno' | 'venta' | 'productos';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeModule, setActiveModule] = useState<Module>('turno');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsAuthenticated(true);
      setUserEmail(session.email);
    }
  }, []);

  useEffect(() => {
    // Cerrar sidebar cuando se cambia de módulo en móvil
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [activeModule, isMobile]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    localStorage.setItem('userSession', JSON.stringify({ email }));
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      setIsAuthenticated(false);
      setUserEmail('');
      localStorage.removeItem('userSession');
      setActiveModule('turno');
      setSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop fijo, Mobile con overlay */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          onLogout={handleLogout}
          userEmail={userEmail}
          isMobile={isMobile}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Overlay en móvil cuando sidebar está abierto */}
      {/* Removido para mejor UX */}

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Mobile header con hamburger menu */}
        {isMobile && (
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between md:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <h1 className="text-lg font-semibold">Heladería POS</h1>
            <div className="w-10" />
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {activeModule === 'turno' && <Turno userEmail={userEmail} />}
            {activeModule === 'venta' && <Venta />}
            {activeModule === 'productos' && <Productos />}
          </div>
        </main>
      </div>
    </div>
  );
}
