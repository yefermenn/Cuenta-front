import { Clock, ShoppingCart, Package, LogOut, IceCream, X, Wallet } from 'lucide-react';

type Module = 'turno' | 'venta' | 'productos' | 'cuentas';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
  onLogout: () => void;
  userName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeModule, onModuleChange, onLogout, userName, isOpen = true, onClose }: SidebarProps) {
  const menuItems: { id: Module; label: string; icon: React.ReactNode }[] = [
    { id: 'turno', label: 'Turno', icon: <Clock className="w-5 h-5" /> },
    { id: 'venta', label: 'Venta', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'productos', label: 'Productos', icon: <Package className="w-5 h-5" /> },
    { id: 'cuentas', label: 'Cuentas', icon: <Wallet className="w-5 h-5" /> },
  ];

  const handleModuleChange = (module: Module) => {
    onModuleChange(module);
    onClose?.();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && onClose && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-white flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <IceCream className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-semibold">Heladería POS</h2>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-400 truncate">{userName || ''}</div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleModuleChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}