import { Menu, IceCream } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  activeModuleLabel: string;
}

export function MobileHeader({ onMenuClick, activeModuleLabel }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <IceCream className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold">{activeModuleLabel}</h1>
        </div>
        
        <div className="w-10"></div> {/* Spacer para centrar el título */}
      </div>
    </header>
  );
}
