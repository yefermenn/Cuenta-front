import { useState, useEffect } from 'react';
import { useSales } from '../hooks/useSales';
import { Plus, FileSpreadsheet, Edit, Trash2, Search, X, DollarSign } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  precioVenta: number;
  precioCompra: number;
}

interface ItemVenta {
  saleDetailId?: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface Venta {
  id: string;
  items: ItemVenta[];
  totalVenta: number;
  fecha: string;
}

export function Venta() {
  const { ventas, refreshSales } = useSales();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [turnoAbierto, setTurnoAbierto] = useState(false);
  const [baseCaja, setBaseCaja] = useState(0);
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');

  // states for inline item editing
  const [itemEditingIdx, setItemEditingIdx] = useState<number | null>(null);
  const [itemEditCantidad, setItemEditCantidad] = useState(1);
  const [itemEditSearchTerm, setItemEditSearchTerm] = useState('');
  const [itemEditSelectedProducto, setItemEditSelectedProducto] = useState<Producto | null>(null);

  useEffect(() => {
    // Cargar datos desde localStorage
    const savedProductos = localStorage.getItem('productos');
    const savedTurno = localStorage.getItem('turnoAbierto');
    const savedBaseCaja = localStorage.getItem('baseCaja');
    const savedUser = localStorage.getItem('user');

    // Cargar user info y mapear productos (ventas ahora vienen del SalesProvider)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        if (Array.isArray(user.products)) {
          const productsFromUser = user.products.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            codigo: p.codigo,
            precio: p.precioVenta,
            precioVenta: p.precioVenta,
            precioCompra: p.precioCompra,
          }));
          setProductos(productsFromUser);
        }
      } catch {
        // si el parsing falla, simplemente ignorar
      }
    }

    // También cargar productos guardados localmente si existen (para casos antiguos)
    if (savedProductos) {
      const parsed = JSON.parse(savedProductos);
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

  const handleSaveVenta = async () => {
    if (items.length === 0) {
      alert('Por favor agregue al menos un producto');
      return;
    }

    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('jwt');

      if (!savedUser || !token) {
        alert('Error: Usuario no autenticado');
        return;
      }

      const user = JSON.parse(savedUser);
      const userId = user.id;

      // Si es edición (editingVenta existe), hacer PATCH
      if (editingVenta) {
        const patchPayload = {
          estado: 'pagada',
          metodo_pago: metodoPago,
          items: items.map((item) => {
            const itemPayload: any = {
              cantidad: item.cantidad,
            };
            // Si el item tiene saleDetailId, es un detalle existente
            if (item.saleDetailId) {
              itemPayload.id = item.saleDetailId;
              // también enviar productId para permitir cambios de producto
              itemPayload.productId = parseInt(item.productoId, 10);
            } else {
              // Si no tiene ID, es un nuevo detalle
              itemPayload.productId = parseInt(item.productoId, 10);
            }
            return itemPayload;
          }),
        };

        const response = await fetch(`/api/sales/${editingVenta.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(patchPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al actualizar la venta');
        }

        const responseData = await response.json();

        // Mapear la respuesta para actualizar el estado local
        const updatedVenta: Venta = {
          id: responseData.id,
          items: Array.isArray(responseData.saleDetails)
            ? responseData.saleDetails.map((detail: any) => ({
                saleDetailId: detail.id,
                productoId: String(detail.productId),
                productoNombre: detail.product?.nombre || 'Desconocido',
                cantidad: detail.cantidad,
                precioUnitario: parseFloat(detail.precio_unitario),
                total: parseFloat(detail.subtotal),
              }))
            : [],
          totalVenta: parseFloat(responseData.total_venta),
          fecha: new Date(responseData.fecha).toLocaleString('es-ES'),
        };

        await refreshSales();
        alert('Venta actualizada correctamente');
        closeModal();
      } else {
        // Si es nueva venta, hacer POST
        const postPayload = {
          userId,
          metodo_pago: metodoPago,
          items: items.map((item) => ({
            productId: parseInt(item.productoId, 10),
            cantidad: item.cantidad,
          })),
        };

        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Error al guardar la venta');
        }

        const responseData = await response.json();

        // Mapear la respuesta para agregar a ventas
        const newVenta: Venta = {
          id: responseData.id,
          items: Array.isArray(responseData.saleDetails)
            ? responseData.saleDetails.map((detail: any) => ({
                saleDetailId: detail.id,
                productoId: String(detail.productId),
                productoNombre: detail.product?.nombre || 'Desconocido',
                cantidad: detail.cantidad,
                precioUnitario: parseFloat(detail.precio_unitario),
                total: parseFloat(detail.subtotal),
              }))
            : [],
          totalVenta: parseFloat(responseData.total_venta),
          fecha: new Date(responseData.fecha).toLocaleString('es-ES'),
        };

        await refreshSales();
        alert('Venta guardada correctamente');
        closeModal();
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido al guardar la venta'}`);
    }
  };

  const handleAddItem = () => {
    if (!selectedProducto) {
      alert('Por favor seleccione un producto');
      return;
    }

    if (cantidad < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    const total = selectedProducto.precioVenta * cantidad;
    const newItem: ItemVenta = {
      productoId: selectedProducto.id,
      productoNombre: selectedProducto.nombre,
      cantidad,
      precioUnitario: selectedProducto.precioVenta,
      total,
    };

    setItems([...items, newItem]);
    setSelectedProducto(null);
    setCantidad(1);
    setSearchTerm('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const openItemEditor = (index: number) => {
    const it = items[index];
    setItemEditingIdx(index);
    setItemEditCantidad(it.cantidad);
    setItemEditSearchTerm('');
    // preload producto for dropdown if exists
    const prod = productos.find((p) => p.id === it.productoId);
    setItemEditSelectedProducto(prod || null);
  };

  const closeItemEditor = () => {
    setItemEditingIdx(null);
    setItemEditCantidad(1);
    setItemEditSearchTerm('');
    setItemEditSelectedProducto(null);
  };

  const saveItemEdit = () => {
    if (itemEditingIdx === null) return;
    const updated: ItemVenta = {
      ...items[itemEditingIdx],
      cantidad: itemEditCantidad,
      productoId: itemEditSelectedProducto ? itemEditSelectedProducto.id : items[itemEditingIdx].productoId,
      productoNombre: itemEditSelectedProducto ? itemEditSelectedProducto.nombre : items[itemEditingIdx].productoNombre,
      precioUnitario: itemEditSelectedProducto ? itemEditSelectedProducto.precioVenta : items[itemEditingIdx].precioUnitario,
      total: (itemEditSelectedProducto ? itemEditSelectedProducto.precioVenta : items[itemEditingIdx].precioUnitario) * itemEditCantidad,
    };
    const newItems = [...items];
    newItems[itemEditingIdx] = updated;
    setItems(newItems);
    closeItemEditor();
  };

  const handleDeleteVenta = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta venta?')) return;
    try {
      const token = localStorage.getItem('jwt');
      await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      // ignorar errores del delete y refrescar para mantener consistencia
    } finally {
      await refreshSales();
    }
  };

  const openModal = (venta?: Venta) => {
    if (!turnoAbierto) {
      alert('Debe abrir el turno primero');
      return;
    }
    
    if (venta) {
      setEditingVenta(venta);
      setItems(venta.items);
    } else {
      setItems([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVenta(null);
    setSearchTerm('');
    setSelectedProducto(null);
    setCantidad(1);
    setItems([]);
    setMetodoPago('efectivo');
  };

  const generateExcel = () => {
    // Simulación de generación de Excel
    alert('Funcionalidad de exportación a Excel - En producción se generaría un archivo descargable');
  };

  // Obtener la fecha de hoy sin hora
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Filtrar ventas del día de hoy solo si el turno está abierto
  const ventasAMostrar = turnoAbierto
    ? ventas.filter((venta) => {
        const ventaDate = new Date(venta.rawFecha);
        return ventaDate >= todayStart && ventaDate <= todayEnd;
      })
    : [];

  // Calcular total en caja: solo con ventas en efectivo del día
  const totalVentasEfectivo = ventasAMostrar
    .filter((v) => v.metodo_pago === 'efectivo')
    .reduce((sum, v) => sum + v.totalVenta, 0);
  const totalEnCaja = baseCaja + totalVentasEfectivo;

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
            <p className="text-xs text-gray-600 mb-1">Ventas (Efectivo)</p>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <p className="text-sm sm:text-lg text-blue-600">{totalVentasEfectivo.toFixed(0)}</p>
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
              {ventasAMostrar.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-3 sm:px-6 py-8 sm:py-12 text-sm text-gray-500">
                    {turnoAbierto ? 'No hay ventas registradas para hoy' : 'El turno está cerrado'}
                  </td>
                </tr>
              ) : (
                ventasAMostrar.map((venta) => {
                  if (venta.items.length > 0) {
                    return venta.items.map((item, itemIndex) => (
                      <tr key={`${venta.id}-${itemIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                          {itemIndex === 0 ? venta.fecha : ''}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{item.productoNombre}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-gray-900">{item.cantidad}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                          ${item.precioUnitario.toFixed(0)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                          ${item.total.toFixed(0)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {itemIndex === 0 && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  }

                  // ventas sin items (vienen del usuario) se muestran en una fila resumen
                  return (
                    <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                        {venta.fecha}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">--</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-gray-900">-</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">-</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right text-gray-900">
                        ${venta.totalVenta.toFixed(0)}
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
                  );
                })
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
              {selectedProducto && (
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
              )}

              {/* Botón Añadir Item */}
              {selectedProducto && (
                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Añadir item
                  </button>
                </div>
              )}

              {/* Total del item actual */}
              {selectedProducto && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Subtotal item:</span>
                    <span className="text-xl text-indigo-600">
                      ${(selectedProducto.precioVenta * cantidad).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Lista de items agregados */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Items agregados ({items.length})</h3>
                  <div className="space-y-2">
                    {items.map((item, index) => 
                      itemEditingIdx === index ? null : (
                        <div
                          key={index}
                          onClick={() => openItemEditor(index)}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.productoNombre}</div>
                            <div className="text-xs text-gray-600">Cant: {item.cantidad} × ${item.precioUnitario.toFixed(0)} = ${item.total.toFixed(0)}</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(index); }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                            title="Eliminar item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Inline item editor */}
                  {itemEditingIdx !== null && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4 mt-4">
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Buscar producto</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={itemEditSearchTerm}
                            onChange={(e) => setItemEditSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="Nombre o código..."
                          />
                        </div>
                        {itemEditSearchTerm && (
                          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredProductos.filter(
                              (p) =>
                                p.nombre.toLowerCase().includes(itemEditSearchTerm.toLowerCase()) ||
                                p.codigo.toLowerCase().includes(itemEditSearchTerm.toLowerCase())
                            ).map((producto) => (
                              <button
                                key={producto.id}
                                onClick={() => {
                                  setItemEditSelectedProducto(producto);
                                  setItemEditSearchTerm('');
                                }}
                                className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-300 last:border-b-0 transition-colors"
                              >
                                <div className="text-sm text-gray-900">{producto.nombre}</div>
                                <div className="text-xs text-gray-600">
                                  Código: {producto.codigo} - ${producto.precioVenta.toFixed(0)}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {itemEditSelectedProducto && (
                        <div className="bg-white border border-indigo-200 rounded-lg p-3">
                          <div className="text-sm text-gray-700 mb-1">Producto seleccionado:</div>
                          <div className="text-gray-900">{itemEditSelectedProducto.nombre}</div>
                          <div className="text-sm text-gray-600">
                            Precio: ${itemEditSelectedProducto.precioVenta.toFixed(0)}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={itemEditCantidad}
                          onChange={(e) => setItemEditCantidad(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={closeItemEditor}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (itemEditingIdx === null) return;
                            handleRemoveItem(itemEditingIdx);
                            closeItemEditor();
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={saveItemEdit}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Total de la venta */}
                  <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">Total Venta:</span>
                      <span className="text-2xl text-indigo-600 font-bold">
                        ${items.reduce((sum, item) => sum + item.total, 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Método de pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="nequi">Nequi</option>
                    </select>
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
                disabled={items.length === 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
