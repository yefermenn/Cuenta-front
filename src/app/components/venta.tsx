import { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Edit, Trash2, Search, X, DollarSign } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  precioVenta: number;
  precioCompra: number;
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
    if (savedProductos) {
      const parsed = JSON.parse(savedProductos);
      // Migrar productos antiguos si es necesario
      const migrated = parsed.map((p: any) => {
        if (!p.precioVenta && p.precio) {
          return { ...p, precioCompra: p.precio * 0.6, precioVenta: p.precio };
        }
        return p;
      });
      setProductos(migrated);
    }
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

    const total = selectedProducto.precioVenta * cantidad;
    const newVenta: Venta = {
      id: editingVenta?.id || Date.now().toString(),
      productoId: selectedProducto.id,
      productoNombre: selectedProducto.nombre,
      cantidad,
      precioUnitario: selectedProducto.precioVenta,
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
    <div>
      <div className="mb-4 sm:mb-6">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl text-gray-900 mb-1 sm:mb-2">Ventas del Turno</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestione las ventas del turno actual</p>
        </div>
        
        {/* Resumen de caja - Responsive */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-2 sm:px-4 sm:py-3">
            <p className="text-xs text-gray-600 mb-1">Base de caja</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              <p className="text-sm sm:text-lg text-indigo-600">{baseCaja.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-2 py-2 sm:px-4 sm:py-3">
            <p className="text-xs text-gray-600 mb-1">Ventas</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <p className="text-sm sm:text-lg text-blue-600">{totalVentas.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-center bg-green-50 border border-green-200 rounded-lg px-2 py-2 sm:px-4 sm:py-3">
            <p className="text-xs text-gray-600 mb-1">Total en caja</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <p className="text-base sm:text-xl text-green-600">{totalEnCaja.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {!turnoAbierto && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 text-sm">
          El turno está cerrado. Abra el turno para registrar ventas.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir venta</span>
          </button>
          <button
            onClick={generateExcel}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generar Excel</span>
          </button>
        </div>

        {/* Tabla responsive */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Fecha</th>
                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Producto</th>
                <th className="text-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Cant.</th>
                <th className="text-right px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">P. Unit.</th>
                <th className="text-right px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Total</th>
                <th className="text-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-3 sm:px-6 py-8 sm:py-12 text-sm text-gray-500">
                    No hay ventas registradas en este turno
                  </td>
                </tr>
              ) : (
                ventas.map((venta) => (
                  <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{venta.fecha}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{venta.productoNombre}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-gray-900">{venta.cantidad}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                      ${venta.precioUnitario.toFixed(0)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                      ${venta.total.toFixed(0)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openModal(venta)}
                          className="p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenta(venta.id)}
                          className="p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl text-gray-900">
                {editingVenta ? 'Editar Venta' : 'Añadir Venta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Buscar producto */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Buscar producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                          <div className="text-sm text-gray-900">{producto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            Código: {producto.codigo} - ${producto.precioVenta.toFixed(0)}
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
                  <div className="text-sm text-gray-700 mb-1">Producto seleccionado:</div>
                  <div className="text-gray-900">{selectedProducto.nombre}</div>
                  <div className="text-sm text-gray-600">
                    Precio: ${selectedProducto.precioVenta.toFixed(0)}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Total */}
              {selectedProducto && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total:</span>
                    <span className="text-xl text-indigo-600">
                      ${(selectedProducto.precioVenta * cantidad).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVenta}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Guardar venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}