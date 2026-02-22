import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Calendar,
  Plus,
  Search,
  X,
  Edit,
  Trash2
} from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
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

interface CompraInventario {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioCompra: number;
  total: number;
  fecha: string;
  fechaISO?: string; // ISO date para ordenamiento
  modifiedAt?: string; // registro de modificaciones para trazabilidad
} 

export function Cuentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [compras, setCompras] = useState<CompraInventario[]>([]);
  const [baseCaja, setBaseCaja] = useState(0);
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Orden y edición de compras
  const [purchaseSortBy, setPurchaseSortBy] = useState<'fecha' | 'producto'>('fecha');
  const [editCompra, setEditCompra] = useState<CompraInventario | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCantidad, setEditCantidad] = useState(1);
  const [editPrecio, setEditPrecio] = useState(0);

  // Caja menor y abonos
  const [cajaMenor, setCajaMenor] = useState(0);
  const [abonoAmount, setAbonoAmount] = useState(0);

  useEffect(() => {
    const savedVentas = localStorage.getItem('ventas');
    const savedProductos = localStorage.getItem('productos');
    const savedBaseCaja = localStorage.getItem('baseCaja');
    const savedCompras = localStorage.getItem('comprasInventario');
    const savedCajaMenor = localStorage.getItem('cajaMenor');
    
    if (savedVentas) setVentas(JSON.parse(savedVentas));
    if (savedProductos) setProductos(JSON.parse(savedProductos));
    if (savedBaseCaja) setBaseCaja(parseFloat(savedBaseCaja));
    if (savedCompras) setCompras(JSON.parse(savedCompras));
    if (savedCajaMenor) setCajaMenor(parseFloat(savedCajaMenor));
  }, []);

  // Calcular totales de ventas
  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  
  // Calcular costo de ventas (productos vendidos)
  const costoVentas = ventas.reduce((sum, venta) => {
    const producto = productos.find(p => p.id === venta.productoId);
    if (producto) {
      return sum + (producto.precioCompra * venta.cantidad);
    }
    return sum;
  }, 0);

  // Utilidad de ventas
  const utilidadVentas = totalVentas - costoVentas;

  // Inversión en inventario (compras)
  const inversionInventario = compras.reduce((sum, c) => sum + c.total, 0);

  // Dinero activo (base de caja + inversión en inventario)
  const dineroActivo = baseCaja + inversionInventario;

  // Total en caja = Base + Total de ventas (según especificación)
  const totalEnCaja = baseCaja + totalVentas;

  // Valor del inventario actual
  const valorInventario = inversionInventario;

  // Calcular stock por producto (compras - ventas)
  const purchasesByProduct = compras.reduce<Record<string, number>>((acc, c) => {
    acc[c.productoId] = (acc[c.productoId] || 0) + c.cantidad;
    return acc;
  }, {});

  const salesByProduct = ventas.reduce<Record<string, number>>((acc, v) => {
    acc[v.productoId] = (acc[v.productoId] || 0) + v.cantidad;
    return acc;
  }, {});

  const stockList = productos.map((p) => ({
    ...p,
    stock: (purchasesByProduct[p.id] || 0) - (salesByProduct[p.id] || 0),
  }));

  // Ordenar por stock descendente para mejorar escaneabilidad
  const sortedStockList = [...stockList].sort((a, b) => b.stock - a.stock || a.nombre.localeCompare(b.nombre));

  const productosConStock = sortedStockList.filter(p => p.stock > 0).length;

  const filteredProductos = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegistrarCompra = () => {
    if (!selectedProducto) {
      alert('Por favor seleccione un producto');
      return;
    }

    if (cantidad < 1) {
      alert('La cantidad debe ser al menos 1');
      return;
    }

    const totalCompra = selectedProducto.precioCompra * cantidad;
    const nuevaCompra: CompraInventario = {
      id: Date.now().toString(),
      productoId: selectedProducto.id,
      productoNombre: selectedProducto.nombre,
      cantidad,
      precioCompra: selectedProducto.precioCompra,
      total: totalCompra,
      fecha: new Date().toLocaleString('es-ES'),
      fechaISO: new Date().toISOString(),
    };

    const updatedCompras = [...compras, nuevaCompra];
    setCompras(updatedCompras);
    localStorage.setItem('comprasInventario', JSON.stringify(updatedCompras));

    // Ajustar base de caja al registrar compra (se asume pago en efectivo)
    const updatedBase = baseCaja - totalCompra;
    setBaseCaja(updatedBase);
    localStorage.setItem('baseCaja', String(updatedBase));

    closeModal();
  };

  const closeModal = () => {
    setShowCompraModal(false);
    setSearchTerm('');
    setSelectedProducto(null);
    setCantidad(1);
  };

  // Eliminar compra - revertir impacto en caja e inventario
  const handleDeleteCompra = (id: string) => {
    const compra = compras.find((c) => c.id === id);
    if (!compra) return;
    if (!confirm(`¿Eliminar compra de ${compra.productoNombre} (${compra.cantidad} u.) por $${compra.total.toFixed(0)}? Esta acción revertirá el impacto en inventario y caja.`)) return;

    const updated = compras.filter((c) => c.id !== id);
    setCompras(updated);
    localStorage.setItem('comprasInventario', JSON.stringify(updated));

    // Revertir impacto en caja
    const updatedBase = baseCaja + compra.total;
    setBaseCaja(updatedBase);
    localStorage.setItem('baseCaja', String(updatedBase));
  };

  // Abrir modal de edición
  const handleOpenEditCompra = (compra: CompraInventario) => {
    setEditCompra(compra);
    setEditCantidad(compra.cantidad);
    setEditPrecio(compra.precioCompra);
    setShowEditModal(true);
  };

  // Guardar edición de compra
  const handleSaveEditCompra = (newCantidad: number, newPrecio: number) => {
    if (!editCompra) return;

    const oldTotal = editCompra.total;
    const newTotal = newCantidad * newPrecio;

    const updatedCompra: CompraInventario = {
      ...editCompra,
      cantidad: newCantidad,
      precioCompra: newPrecio,
      total: newTotal,
      modifiedAt: new Date().toISOString(),
    };

    const updatedCompras = compras.map((c) => (c.id === editCompra.id ? updatedCompra : c));
    setCompras(updatedCompras);
    localStorage.setItem('comprasInventario', JSON.stringify(updatedCompras));

    // Ajustar baseCaja según diferencia
    const delta = newTotal - oldTotal;
    const updatedBase = baseCaja - delta; // si delta>0 se gasta más, si <0 se libera efectivo
    setBaseCaja(updatedBase);
    localStorage.setItem('baseCaja', String(updatedBase));

    setShowEditModal(false);
    setEditCompra(null);
  };

  // Mover monto de Caja menor a Caja mayor (Abono)
  const handleAbono = () => {
    const monto = Number(abonoAmount) || 0;
    if (monto <= 0) {
      alert('Ingrese un monto válido para abonar');
      return;
    }
    if (monto > cajaMenor) {
      alert('El monto supera el saldo de Caja menor');
      return;
    }

    const nuevoCajaMenor = cajaMenor - monto;
    const nuevoBase = baseCaja + monto; // se suma a base (afecta Total en Caja)

    setCajaMenor(nuevoCajaMenor);
    localStorage.setItem('cajaMenor', String(nuevoCajaMenor));

    setBaseCaja(nuevoBase);
    localStorage.setItem('baseCaja', String(nuevoBase));

    setAbonoAmount(0);
  }; 

  // Filtrar ventas por período
  const getVentasByPeriodo = () => {
    const now = new Date();
    const filteredVentas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      if (periodo === 'semana') {
        const unaSemanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return fechaVenta >= unaSemanaAtras;
      } else {
        const unMesAtras = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return fechaVenta >= unMesAtras;
      }
    });
    return filteredVentas;
  };

  const ventasPeriodo = getVentasByPeriodo();
  const totalVentasPeriodo = ventasPeriodo.reduce((sum, v) => sum + v.total, 0);
  const cantidadVentasPeriodo = ventasPeriodo.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-1 sm:mb-2">Cuentas</h1>
        <p className="text-sm sm:text-base text-gray-600">Control financiero y estado del negocio</p>
      </div>

      {/* Resumen de Ventas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Resumen de Ventas
          </h2>
          
          {/* Selector de período */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriodo('semana')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors ${
                periodo === 'semana'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md transition-colors ${
                periodo === 'mes'
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Período</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">
              {periodo === 'semana' ? 'Última semana' : 'Último mes'}
            </div>
          </div>

          {/* Utilidad movida aquí en lugar de Total ventas */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Utilidad</span>
            </div>
            <div className="text-xl font-semibold text-green-900">
              ${utilidadVentas.toFixed(0)}
            </div>
          </div>

          {/* Total en caja movida aquí en lugar de Cantidad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">Total en Caja</span>
            </div>
            <div className="text-xl font-semibold text-blue-900">
              ${totalEnCaja.toFixed(0)}
            </div>
          </div>
        </div>
      </div>


      {/* Estado de Caja */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-indigo-600" />
          Estado de Caja
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Caja mayor (antes Dinero Activo) */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-indigo-900 font-medium">Caja mayor</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-900">
              ${dineroActivo.toFixed(0)}
            </div>
            <p className="text-xs text-indigo-700 mt-1">Base + Inventario</p>
          </div>

          {/* Caja menor */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-yellow-900 font-medium">Caja menor</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-900">
              ${cajaMenor.toFixed(0)}
            </div>
            <p className="text-xs text-yellow-700 mt-1">Caja chica / fondo menor</p>
          </div>

          {/* Acciones: Abono */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-2 font-medium">Abono a Caja mayor</div>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={abonoAmount}
                onChange={(e) => setAbonoAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Monto"
              />
              <button
                onClick={() => handleAbono()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Abono
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Transfiere fondos de Caja menor a Caja mayor</p>
          </div>
        </div>

        {/* Desglose */}
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-gray-600 text-xs mb-1">Base de caja</p>
            <p className="font-semibold text-gray-900">${baseCaja.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Ventas totales</p>
            <p className="font-semibold text-green-700">${totalVentas.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Costo ventas</p>
            <p className="font-semibold text-orange-700">${costoVentas.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Inv. Inventario</p>
            <p className="font-semibold text-indigo-700">${inversionInventario.toFixed(0)}</p>
          </div>
        </div>
      </div>

      
      {/* Inventario y Registro de Compras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Valor del Inventario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Inventario
          </h2>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 mb-2">Valor total del inventario</p>
            <div className="text-3xl font-bold text-purple-900">
              ${valorInventario.toFixed(0)}
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Basado en {compras.length} {compras.length === 1 ? 'compra registrada' : 'compras registradas'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Inventario por producto</p>

            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 rounded-md border border-gray-100">
              {sortedStockList.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No hay productos en el inventario</div>
              ) : (
                sortedStockList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{p.nombre}</div>
                      <div className="text-xs text-gray-500 truncate">{p.codigo}</div>
                    </div>
                    <div className={`ml-4 text-sm font-semibold ${p.stock > 0 ? 'text-green-700' : p.stock < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {p.stock} {p.stock === 1 ? 'unidad' : 'unidades'}
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {productosConStock} {productosConStock === 1 ? 'producto con stock' : 'productos con stock'}
            </p>
          </div>
        </div>

        {/* Registrar Compra */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Compra de Productos
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Registre las compras de productos para mantener el control de su inventario e inversión.
          </p>

          <button
            onClick={() => setShowCompraModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Registrar compra
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Historial de compras</p>
              <div className="inline-flex gap-2">
                <button
                  onClick={() => setPurchaseSortBy('fecha')}
                  className={`px-2 py-1 rounded-md text-xs ${purchaseSortBy === 'fecha' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Ordenar por fecha
                </button>
                <button
                  onClick={() => setPurchaseSortBy('producto')}
                  className={`px-2 py-1 rounded-md text-xs ${purchaseSortBy === 'producto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Ordenar por producto
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-md border border-gray-100">
              {compras.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No hay compras registradas</div>
              ) : (
                <div className="w-full">
                  {compras
                    .slice()
                    .sort((a, b) => {
                      if (purchaseSortBy === 'fecha') {
                        const ta = new Date(a.fechaISO || a.fecha).getTime();
                        const tb = new Date(b.fechaISO || b.fecha).getTime();
                        return tb - ta; // más reciente primero
                      }
                      return a.productoNombre.localeCompare(b.productoNombre);
                    })
                    .map((c) => (
                      <div key={c.id} className="grid grid-cols-6 gap-2 items-center px-4 py-2 border-b border-gray-100 text-sm">
                        <div className="col-span-2">
                          <div className="font-medium text-gray-900 truncate">{c.productoNombre}</div>
                          <div className="text-xs text-gray-500">{productos.find(p => p.id === c.productoId)?.codigo || '-'}</div>
                        </div>
                        <div className="text-xs text-gray-600">{new Date(c.fechaISO || c.fecha).toLocaleString('es-ES')}</div>
                        <div className="text-sm text-gray-900">{c.cantidad}</div>
                        <div className="text-sm text-gray-900">${c.precioCompra.toFixed(0)}</div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <span>${c.total.toFixed(0)}</span>
                          <button onClick={() => handleOpenEditCompra(c)} className="p-1 rounded-md hover:bg-gray-50" aria-label="Editar compra">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => handleDeleteCompra(c.id)} className="p-1 rounded-md hover:bg-gray-50" aria-label="Eliminar compra">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal edición de compra */}
          {showEditModal && editCompra && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl text-gray-900">Editar compra</h2>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm text-gray-700 mb-1 font-medium">Producto</div>
                    <div className="text-gray-900 font-semibold">{editCompra.productoNombre} ({productos.find(p => p.id === editCompra.productoId)?.codigo || '-'})</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Cantidad</label>
                    <input type="number" min="1" value={editCantidad} onChange={(e) => setEditCantidad(parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Precio unitario</label>
                    <input type="number" min="0" value={editPrecio} onChange={(e) => setEditPrecio(parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total de compra:</span>
                      <span className="text-2xl font-bold text-purple-700">${(editCantidad * editPrecio).toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium">Cancelar</button>
                  <button onClick={() => handleSaveEditCompra(editCantidad, editPrecio)} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium">Guardar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Registrar Compra */}
      {showCompraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl text-gray-900">Registrar Compra</h2>
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
                <label className="block text-sm font-medium mb-2 text-gray-700">Buscar producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
                          <div className="text-sm text-gray-900 font-medium">{producto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {producto.codigo} - Precio compra: ${producto.precioCompra.toFixed(0)}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Producto seleccionado */}
              {selectedProducto && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-1 font-medium">Producto seleccionado:</div>
                  <div className="text-gray-900 font-semibold">{selectedProducto.nombre}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Código: {selectedProducto.codigo}
                  </div>
                  <div className="text-sm text-indigo-700 font-medium mt-1">
                    Precio de compra: ${selectedProducto.precioCompra.toFixed(0)}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Total */}
              {selectedProducto && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total de compra:</span>
                    <span className="text-2xl font-bold text-purple-700">
                      ${(selectedProducto.precioCompra * cantidad).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarCompra}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors font-medium"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
