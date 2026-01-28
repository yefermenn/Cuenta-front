import { useState, useEffect } from 'react';
import { User, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface TurnoProps {
  userEmail: string;
}

export function Turno({ userEmail }: TurnoProps) {
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [baseCaja, setBaseCaja] = useState('');
  const [baseCajaGuardada, setBaseCajaGuardada] = useState(0);
  const [showBaseCajaInput, setShowBaseCajaInput] = useState(false);

  useEffect(() => {
    // Cargar estado del turno desde localStorage
    const savedState = localStorage.getItem('turnoAbierto');
    const savedBaseCaja = localStorage.getItem('baseCaja');
    if (savedState) {
      setTurnoAbierto(JSON.parse(savedState));
    }
    if (savedBaseCaja) {
      setBaseCajaGuardada(parseFloat(savedBaseCaja));
    }
  }, []);

  const handleAbrirTurno = () => {
    if (!baseCaja || parseFloat(baseCaja) < 0) {
      alert('Ingrese una base de caja válida');
      return;
    }
    
    const baseNum = parseFloat(baseCaja);
    setTurnoAbierto(true);
    setBaseCajaGuardada(baseNum);
    localStorage.setItem('turnoAbierto', JSON.stringify(true));
    localStorage.setItem('baseCaja', baseNum.toString());
    setShowBaseCajaInput(false);
    setBaseCaja('');
  };

  const handleCerrarTurno = () => {
    if (confirm('¿Está seguro de cerrar el turno? Se borrarán todas las ventas y la base de caja volverá a 0.')) {
      setTurnoAbierto(false);
      setBaseCajaGuardada(0);
      localStorage.setItem('turnoAbierto', JSON.stringify(false));
      localStorage.removeItem('baseCaja');
      localStorage.removeItem('ventas');
    }
  };

  const handleClickAbrirTurno = () => {
    setShowBaseCajaInput(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-0 sm:px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="text-center">
          {/* Usuario */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-full mb-4">
              <User className="w-8 sm:w-10 h-8 sm:h-10 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Bienvenido</h2>
            <p className="text-sm sm:text-base text-gray-600 truncate px-2">{userEmail}</p>
          </div>

          {/* Estado del turno */}
          <div className="mb-8 flex justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2 border-gray-200">
              <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-gray-500 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-700 font-medium">Estado:</span>
              <div
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full ${
                  turnoAbierto
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {turnoAbierto ? (
                  <>
                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base">Abierto</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base">Cerrado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Base de caja actual */}
          {turnoAbierto && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 inline-block">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-gray-600">Base de caja</div>
                  <div className="text-lg sm:text-xl font-semibold text-indigo-600">${baseCajaGuardada.toFixed(0)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Input de base de caja */}
          {showBaseCajaInput && !turnoAbierto && (
            <div className="mb-6 w-full max-w-sm mx-auto px-4 sm:px-0">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Ingrese la base de caja inicial
              </label>
              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={baseCaja}
                  onChange={(e) => setBaseCaja(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBaseCajaInput(false);
                    setBaseCaja('');
                  }}
                  className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbrirTurno}
                  className="flex-1 px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          {!showBaseCajaInput && (
            <>
              <button
                onClick={turnoAbierto ? handleCerrarTurno : handleClickAbrirTurno}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 w-full sm:w-auto ${
                  turnoAbierto
                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-200'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg shadow-green-200'
                }`}
              >
                {turnoAbierto ? 'Cerrar turno' : 'Abrir turno'}
              </button>

              {!turnoAbierto && (
                <p className="mt-4 text-xs sm:text-sm text-gray-500 px-2">
                  Debe abrir el turno para comenzar a registrar ventas
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}