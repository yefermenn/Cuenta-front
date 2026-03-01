import { useState, useEffect } from 'react';
import { User, Clock, CheckCircle, XCircle, DollarSign, X } from 'lucide-react';
import { useSales } from '../hooks/useSales';

interface TurnoProps {
  userName?: string;
}

export function Turno({ userName }: TurnoProps) {
  const { ventas } = useSales();
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [baseCaja, setBaseCaja] = useState('');
  const [baseCajaGuardada, setBaseCajaGuardada] = useState(0);
  const [showBaseCajaInput, setShowBaseCajaInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCierreModal, setShowCierreModal] = useState(false);

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
  const patchUser = async (payload: { shift?: boolean; base?: number }) => {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwt');
    if (!rawUser || !token) throw new Error('No hay sesión activa');
    const user = JSON.parse(rawUser);
    const userId = user?.id || user?.Id || user?.userId;
    if (!userId) throw new Error('ID de usuario no disponible');

    const res = await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = err?.message || err?.error || 'Error actualizando usuario';
      throw new Error(message);
    }

    const updated = await res.json().catch(() => null);
    if (updated) {
      // si backend devuelve usuario actualizado, lo guardamos
      try {
        const newUser = updated.detail ?? updated.user ?? updated;
        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
          localStorage.setItem('userSession', JSON.stringify(newUser));
        }
      } catch {}
    }
    return updated;
  };

  const handleAbrirTurno = async () => {
    if (!baseCaja || parseFloat(baseCaja) < 0) {
      alert('Ingrese una base de caja válida');
      return;
    }
    const baseNum = parseFloat(baseCaja);
    setProcessing(true);
    try {
      await patchUser({ shift: true, base: baseNum });
      setTurnoAbierto(true);
      setBaseCajaGuardada(baseNum);
      localStorage.setItem('turnoAbierto', JSON.stringify(true));
      localStorage.setItem('baseCaja', baseNum.toString());
      setShowBaseCajaInput(false);
      setBaseCaja('');
    } catch (err: any) {
      alert(err?.message || 'Error al abrir turno');
    } finally {
      setProcessing(false);
    }
  };

  const handleCerrarTurno = () => {
    setShowCierreModal(true);
  };

  const handleConfirmarCierre = async () => {
    setProcessing(true);
    try {
      await patchUser({ shift: false, base: 0 });
      setTurnoAbierto(false);
      setBaseCajaGuardada(0);
      localStorage.setItem('turnoAbierto', JSON.stringify(false));
      localStorage.removeItem('baseCaja');
      localStorage.removeItem('ventas');
      setShowCierreModal(false);
    } catch (err: any) {
      alert(err?.message || 'Error al cerrar turno');
    } finally {
      setProcessing(false);
    }
  };

  // Obtener la fecha de hoy sin hora para filtrar ventas del día
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Filtrar ventas del día de hoy
  const ventasHoy = ventas.filter((venta) => {
    const ventaDate = new Date(venta.rawFecha);
    return ventaDate >= todayStart && ventaDate <= todayEnd;
  });

  // Calcular totales
  const totalVentasEfectivo = ventasHoy
    .filter((v) => v.metodo_pago === 'efectivo')
    .reduce((sum, v) => sum + v.totalVenta, 0);
  
  const totalVentasNequi = ventasHoy
    .filter((v) => v.metodo_pago === 'nequi')
    .reduce((sum, v) => sum + v.totalVenta, 0);

  const totalEnCaja = baseCajaGuardada + totalVentasEfectivo;

  const handleClickAbrirTurno = () => {
    setShowBaseCajaInput(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          {/* Usuario */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
            </div>
            <h2 className="text-xl sm:text-2xl text-gray-900 mb-1">Bienvenido</h2>
            <p className="text-sm sm:text-base text-gray-600 px-4 break-words">{userName || ''}</p>
          </div>

          {/* Estado del turno */}
          <div className="mb-8">
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Estado del turno:</span>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  turnoAbierto
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {turnoAbierto ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm sm:text-base">Turno abierto</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold text-sm sm:text-base">Turno cerrado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Base de caja actual */}
          {turnoAbierto && (
            <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 inline-block">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <div className="text-xs sm:text-sm text-gray-600">Base de caja</div>
                  <div className="text-lg sm:text-xl text-indigo-600">${baseCajaGuardada.toFixed(0)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Input de base de caja */}
          {showBaseCajaInput && !turnoAbierto && (
            <div className="mb-6 max-w-sm mx-auto px-4">
              <label className="block text-sm mb-2 text-gray-700">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
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
                  className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbrirTurno}
                  className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors active:bg-green-800"
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
                disabled={processing}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 active:scale-95 ${
                  turnoAbierto
                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-200'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-lg shadow-green-200'
                } ${processing ? 'opacity-70 cursor-wait' : ''}`}
              >
                {processing ? 'Procesando...' : turnoAbierto ? 'Cerrar turno' : 'Abrir turno'}
              </button>

              {!turnoAbierto && (
                <p className="mt-4 text-xs sm:text-sm text-gray-500 px-4">
                  Debe abrir el turno para comenzar a registrar ventas
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de cierre de turno */}
      {showCierreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Cierre de Turno</h2>
              <button
                onClick={() => setShowCierreModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Total en caja */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Total en caja</label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="text-2xl font-bold text-green-600">{totalEnCaja.toFixed(0)}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Base ({baseCajaGuardada.toFixed(0)}) + Efectivo ({totalVentasEfectivo.toFixed(0)})
                  </p>
                </div>
              </div>

              {/* Total en Nequi */}
              <div>
                <label className="block text-sm text-gray-600 mb-2">Total de ventas en Nequi</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="text-2xl font-bold text-blue-600">{totalVentasNequi.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => setShowCierreModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarCierre}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-70"
                >
                  {processing ? 'Cerrando...' : 'Cerrar turno'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}