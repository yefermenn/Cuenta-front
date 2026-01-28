import { Clock, ShoppingCart, Package, LogOut, IceCream } from 'lucide-react';

type Module = 'turno' | 'venta' | 'productos';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  onLogout: () => void;
  userEmail: string;
  isMobile?: boolean;
  onCloseSidebar?: () => void;
}

export function Sidebar({ 
  activeModule, 
  onModuleChange, 
  onLogout, 
  userEmail,
  isMobile = false,
  onCloseSidebar
}: SidebarProps) {
  const menuItems: { id: Module; label: string; icon: React.ReactNode }[] = [
    { id: 'turno', label: 'Turno', icon: <Clock className="w-5 h-5" /> },
    { id: 'venta', label: 'Venta', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'productos', label: 'Productos', icon: <Package className="w-5 h-5" /> },
  ];

  const handleModuleClick = (module: Module) => {
    onModuleChange(module);
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <IceCream className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm md:text-base">Heladería POS</h2>
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-400 truncate">{userEmail}</div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleModuleClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm md:text-base ${
                  activeModule === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 text-sm md:text-base"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
