import { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Edit, Trash2, Search, X, DollarSign } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
}

interface Venta {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
}

export function Venta() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [baseCaja, setBaseCaja] = useState(0);

  useEffect(() => {
    // Cargar datos desde localStorage
    const savedVentas = localStorage.getItem('ventas');
    const savedProductos = localStorage.getItem('productos');
    const savedTurno = localStorage.getItem('turnoAbierto');
    const savedBaseCaja = localStorage.getItem('baseCaja');
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedProductos) setProductos(JSON.parse(savedProductos));
    if (savedTurno) setTurnoAbierto(JSON.parse(savedTurno));
    if (savedBaseCaja) setBaseCaja(parseFloat(savedBaseCaja));
  }, []);

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveVenta = () => {
    if (!selectedProducto) {
      alert('Por favor seleccione un producto');
      return;
    }

    if (cantidad < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    const total = selectedProducto.precio * cantidad;
    const newVenta: Venta = {
      id: editingVenta?.id || Date.now().toString(),
      productoId: selectedProducto.id,
      productoNombre: selectedProducto.nombre,
      cantidad,
      precioUnitario: selectedProducto.precio,
      total,
      fecha: new Date().toLocaleString('es-ES'),
    };

    let updatedVentas;
    if (editingVenta) {
      updatedVentas = ventas.map((v) => (v.id === editingVenta.id ? newVenta : v));
    } else {
      updatedVentas = [...ventas, newVenta];
    }

    setVentas(updatedVentas);
    localStorage.setItem('ventas', JSON.stringify(updatedVentas));
    
    closeModal();
  };

  const handleDeleteVenta = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta venta?')) {
      const updatedVentas = ventas.filter((v) => v.id !== id);
      setVentas(updatedVentas);
      localStorage.setItem('ventas', JSON.stringify(updatedVentas));
    }
  };

  const openModal = (venta?: Venta) => {
    if (!turnoAbierto) {
      alert('Debe abrir el turno primero');
      return;
    }
    
    if (venta) {
      setEditingVenta(venta);
      const producto = productos.find((p) => p.id === venta.productoId);
      setSelectedProducto(producto || null);
      setCantidad(venta.cantidad);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVenta(null);
    setSearchTerm('');
    setSelectedProducto(null);
    setCantidad(1);
  };

  const generateExcel = () => {
    // Simulación de generación de Excel
    alert('Funcionalidad de exportación a Excel - En producción se generaría un archivo descargable');
  };

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  const totalEnCaja = baseCaja + totalVentas;

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ventas del Turno</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestione las ventas del turno actual</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Base de caja</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <p className="text-lg sm:text-xl font-semibold text-indigo-600">{baseCaja.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Ventas</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-lg sm:text-xl font-semibold text-blue-600">{totalVentas.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total en caja</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-lg sm:text-xl font-semibold text-green-600">{totalEnCaja.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {!turnoAbierto && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
          El turno está cerrado. Abra el turno para registrar ventas.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center sm:justify-start gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Añadir venta</span>
            <span className="sm:hidden">Venta</span>
          </button>
          <button
            onClick={generateExcel}
            className="flex items-center justify-center sm:justify-start gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
          >
            <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Reporte Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Fecha</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Producto</th>
                <th className="text-center px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Cant.</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Precio</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Total</th>
                <th className="text-center px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 sm:px-6 py-12 text-sm sm:text-base text-gray-500">
                    No hay ventas registradas en este turno
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{venta.fecha}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 truncate">{venta.productoNombre}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-gray-900">{venta.cantidad}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                      ${venta.precioUnitario.toFixed(0)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900 font-semibold">
                      ${venta.total.toFixed(0)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openModal(venta)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenta(venta.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Añadir/Editar Venta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90vh] sm:max-h-none flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editingVenta ? 'Editar Venta' : 'Añadir Venta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Buscar producto */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Buscar producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
                    placeholder="Nombre o código..."
                  />
                </div>

                {/* Lista de productos filtrados */}
                {searchTerm && (
                  <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredProductos.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No se encontraron productos
                      </div>
                    ) : (
                      filteredProductos.map((producto) => (
                        <button
                          key={producto.id}
                          onClick={() => {
                            setSelectedProducto(producto);
                            setSearchTerm('');
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            Código: {producto.codigo} - ${producto.precio.toFixed(0)}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Producto seleccionado */}
              {selectedProducto && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="text-xs sm:text-sm text-gray-700 mb-1 font-medium">Producto seleccionado:</div>
                  <div className="text-sm sm:text-base font-semibold text-gray-900">{selectedProducto.nombre}</div>
                  <div className="text-sm text-gray-600">
                    Precio: ${selectedProducto.precio.toFixed(0)}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
                />
              </div>

              {/* Total */}
              {selectedProducto && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-medium text-gray-700">Total:</span>
                    <span className="text-lg sm:text-xl font-bold text-indigo-600">
                      ${(selectedProducto.precio * cantidad).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVenta}
                className="flex-1 px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
