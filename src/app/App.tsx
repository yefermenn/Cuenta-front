import { useState, useEffect } from 'react';
import { SalesProvider } from './hooks/useSales';
import { Login } from '@/app/components/login';
import { Sidebar } from '@/app/components/sidebar';
import { MobileHeader } from '@/app/components/mobile-header';
import { Turno } from '@/app/components/turno';
import { Venta } from '@/app/components/venta';
import { Productos } from '@/app/components/productos';
import { Cuentas } from '@/app/components/cuentas';
import { hasValidSession, getCurrentUserName, logout } from '@/services/authService';
import { onAuthStatusChange } from '@/services/apiClient';

type Module = 'turno' | 'venta' | 'productos' | 'cuentas';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeModule, setActiveModule] = useState<Module>('turno');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Inicializar sesión al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (hasValidSession()) {
          setIsAuthenticated(true);
          const name = getCurrentUserName();
          setUserName(name);
        } else {
          setIsAuthenticated(false);
          setUserName('');
        }
      } finally {
        setIsLoadingSession(false);
      }
    };

    initAuth();
  }, []);

  // Suscribirse a cambios de autenticación (ej: cuando el token expira)
  useEffect(() => {
    const unsubscribe = onAuthStatusChange((authenticated) => {
      setIsAuthenticated(authenticated);
      if (!authenticated) {
        setUserName('');
        setActiveModule('turno');
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    const name = getCurrentUserName();
    setUserName(name || email);
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      logout();
      setIsAuthenticated(false);
      setUserName('');
      setActiveModule('turno');
    }
  };

  const getModuleLabel = () => {
    const labels = {
      turno: 'Turno',
      venta: 'Venta',
      productos: 'Productos',
      cuentas: 'Cuentas',
    };
    return labels[activeModule];
  };

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SalesProvider>
      <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onLogout={handleLogout}
        userName={userName}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          activeModuleLabel={getModuleLabel()}
        />
        
        <div className="flex-1 overflow-auto pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {activeModule === 'turno' && <Turno userName={userName} />}
            {activeModule === 'venta' && <Venta />}
            {activeModule === 'productos' && <Productos />}
            {activeModule === 'cuentas' && <Cuentas />}
          </div>
        </div>
      </main>
    </div>
    </SalesProvider>
  );
}