import { useState, useEffect } from 'react';
import { SalesProvider } from './hooks/useSales';
import { Login } from '@/app/components/login';
import { Sidebar } from '@/app/components/sidebar';
import { MobileHeader } from '@/app/components/mobile-header';
import { Turno } from '@/app/components/turno';
import { Venta } from '@/app/components/venta';
import { Productos } from '@/app/components/productos';
import { Cuentas } from '@/app/components/cuentas';

type Module = 'turno' | 'venta' | 'productos' | 'cuentas';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeModule, setActiveModule] = useState<Module>('turno');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsAuthenticated(true);
      setUserName(session.nombre ?? session.name ?? session.email ?? '');
    }
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setUserName(session.nombre ?? session.name ?? session.email ?? email);
    } else {
      setUserName(email);
      localStorage.setItem('userSession', JSON.stringify({ email }));
    }
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      setIsAuthenticated(false);
      setUserName('');
      localStorage.removeItem('userSession');
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
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