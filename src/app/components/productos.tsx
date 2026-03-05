import { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Edit, Trash2, X, TrendingUp } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precioCompra: number;
  precioVenta: number;
}

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [inventario, setInventario] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Priorizar productos que vienen en la sesión (`sessionStorage.user`)
    const rawUser = sessionStorage.getItem('user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        if (Array.isArray(user.products) && user.products.length > 0) {
          const mapped = user.products.map((p: any) => ({
            id: String(p.id),
            nombre: p.nombre,
            codigo: String(p.codigo),
            precioCompra: Number(p.precioCompra),
            precioVenta: Number(p.precioVenta),
          }));
          setProductos(mapped);
          localStorage.setItem('productos', JSON.stringify(mapped));
          return;
        }
      } catch {}
    }

    // Fallback a productos guardados localmente
    const savedProductos = localStorage.getItem('productos');
    if (savedProductos) {
      const parsed = JSON.parse(savedProductos);
      const migrated = parsed.map((p: any) => {
        if (!p.precioCompra && p.precio) {
          return {
            ...p,
            precioCompra: Math.round(p.precio * 0.6),
            precioVenta: p.precio,
          };
        }
        return p;
      });
      setProductos(migrated);
      localStorage.setItem('productos', JSON.stringify(migrated));
    }
  }, []);

  const handleSaveProducto = () => {
    if (!nombre.trim() || !codigo.trim() || !precioCompra || !precioVenta || inventario === '') {
      alert('Por favor complete todos los campos');
      return;
    }

    const precioCompraNum = parseFloat(precioCompra);
    const precioVentaNum = parseFloat(precioVenta);
    
    if (isNaN(precioCompraNum) || precioCompraNum <= 0) {
      alert('Ingrese un precio de compra válido');
      return;
    }

    if (isNaN(precioVentaNum) || precioVentaNum <= 0) {
      alert('Ingrese un precio de venta válido');
      return;
    }

    if (precioVentaNum <= precioCompraNum) {
      alert('El precio de venta debe ser mayor que el precio de compra');
      return;
    }

    const newProducto: Producto = {
      id: editingProducto?.id || Date.now().toString(),
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      precioCompra: precioCompraNum,
      precioVenta: precioVentaNum,
    };
    let updatedProductos;
    if (editingProducto) {
      // Actualizar en backend
      (async () => {
        setSaving(true);
        try {
          const rawUser = sessionStorage.getItem('user');
          const token = sessionStorage.getItem('jwt');
          if (!rawUser || !token) throw new Error('No hay sesión activa');
          const user = JSON.parse(rawUser);
          const userId = user?.id || user?.Id || user?.userId;
          if (!userId) throw new Error('ID de usuario no disponible');

          const payload = {
            nombre: newProducto.nombre,
            precioCompra: newProducto.precioCompra,
            precioVenta: newProducto.precioVenta,
            codigo: isNaN(Number(newProducto.codigo)) ? newProducto.codigo : Number(newProducto.codigo),
            inventario: Number(inventario) || 0,
            userId,
          };

          const res = await fetch(`/api/products/${editingProducto.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.message || err?.error || 'Error actualizando producto');
          }

          const updated = await res.json().catch(() => null);
          const updatedItem = updated?.detail ?? updated?.product ?? updated ?? null;

          const toUpdate: Producto = {
            id: String(updatedItem?.id ?? editingProducto.id),
            nombre: updatedItem?.nombre ?? newProducto.nombre,
            codigo: String(updatedItem?.codigo ?? newProducto.codigo),
            precioCompra: Number(updatedItem?.precioCompra ?? newProducto.precioCompra),
            precioVenta: Number(updatedItem?.precioVenta ?? newProducto.precioVenta),
          };

          const updatedProductosLocal = productos.map((p) => (p.id === editingProducto.id ? toUpdate : p));
          setProductos(updatedProductosLocal);
          localStorage.setItem('productos', JSON.stringify(updatedProductosLocal));

          // actualizar user.products si existe
          try {
            const rawUser2 = sessionStorage.getItem('user');
            if (rawUser2) {
              const u = JSON.parse(rawUser2);
              if (Array.isArray(u.products)) {
                u.products = u.products.map((p: any) => (String(p.id) === String(editingProducto.id) ? { ...p, nombre: toUpdate.nombre, codigo: toUpdate.codigo, precioCompra: toUpdate.precioCompra, precioVenta: toUpdate.precioVenta, inventario: Number(inventario) } : p));
                sessionStorage.setItem('user', JSON.stringify(u));
                sessionStorage.setItem('userSession', JSON.stringify(u));
              }
            }
          } catch {}

          closeModal();
        } catch (err: any) {
          alert(err?.message || 'Error al actualizar producto');
        } finally {
          setSaving(false);
        }
      })();
      return;
    }

    // Crear en el backend usando jwt y userId
    (async () => {
      setSaving(true);
      try {
        const rawUser = sessionStorage.getItem('user');
        const token = sessionStorage.getItem('jwt');
        if (!rawUser || !token) throw new Error('No hay sesión activa');
        const user = JSON.parse(rawUser);
        const userId = user?.id || user?.Id || user?.userId;
        if (!userId) throw new Error('ID de usuario no disponible');

        if (productos.some((p) => p.codigo === newProducto.codigo)) {
          alert('Ya existe un producto con ese código');
          setSaving(false);
          return;
        }

        const payload = {
          nombre: newProducto.nombre,
          precioCompra: newProducto.precioCompra,
          precioVenta: newProducto.precioVenta,
          codigo: isNaN(Number(newProducto.codigo)) ? newProducto.codigo : Number(newProducto.codigo),
          inventario: Number(inventario) || 0,
          userId,
        };

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || err?.error || 'Error creando producto');
        }

        const created = await res.json().catch(() => null);
        const createdItem = created?.detail ?? created?.product ?? created ?? null;
        const toInsert: Producto = {
          id: String(createdItem?.id ?? Date.now().toString()),
          nombre: createdItem?.nombre ?? newProducto.nombre,
          codigo: String(createdItem?.codigo ?? newProducto.codigo),
          precioCompra: Number(createdItem?.precioCompra ?? newProducto.precioCompra),
          precioVenta: Number(createdItem?.precioVenta ?? newProducto.precioVenta),
        };

        updatedProductos = [...productos, toInsert];
        setProductos(updatedProductos);
        localStorage.setItem('productos', JSON.stringify(updatedProductos));
        closeModal();
      } catch (err: any) {
        alert(err?.message || 'Error al crear producto');
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleDeleteProducto = (id: string) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
      return;
    }
    (async () => {
      try {
        const token = sessionStorage.getItem('jwt');
        if (!token) throw new Error('No hay sesión activa');
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || err?.error || 'Error eliminando producto');
        }
        // actualizar listado local
        const updatedProductos = productos.filter((p) => p.id !== id);
        setProductos(updatedProductos);
        localStorage.setItem('productos', JSON.stringify(updatedProductos));
        // también actualizar en user.products si existe
        try {
          const rawUser = sessionStorage.getItem('user');
          if (rawUser) {
            const u = JSON.parse(rawUser);
            if (Array.isArray(u.products)) {
              u.products = u.products.filter((p: any) => String(p.id) !== String(id));
              sessionStorage.setItem('user', JSON.stringify(u));
              sessionStorage.setItem('userSession', JSON.stringify(u));
            }
          }
        } catch {}
      } catch (err: any) {
        alert(err?.message || 'Error al eliminar producto');
      }
    })();
  };

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setNombre(producto.nombre);
      setCodigo(producto.codigo);
      setPrecioCompra(producto.precioCompra.toString());
      setPrecioVenta(producto.precioVenta.toString());
      // Try to populate inventory if available
      // @ts-ignore
      setInventario(producto.inventario != null ? String(producto.inventario) : '0');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setNombre('');
    setCodigo('');
    setPrecioCompra('');
    setPrecioVenta('');
    setInventario('0');
  };

  const generateExcel = () => {
    // Simulación de generación de Excel
    alert('Funcionalidad de exportación a Excel - En producción se generaría un archivo descargable');
  };

  const calcularGanancia = (precioVenta: number, precioCompra: number) => {
    return precioVenta - precioCompra;
  };

  const calcularMargen = (precioVenta: number, precioCompra: number) => {
    return ((precioVenta - precioCompra) / precioVenta * 100).toFixed(0);
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-1 sm:mb-2">Productos</h1>
        <p className="text-sm sm:text-base text-gray-600">Administre el catálogo de productos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo producto</span>
          </button>
          <button
            onClick={generateExcel}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generar Excel</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Nombre</th>
                <th className="text-left px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Código</th>
                <th className="text-right px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center justify-end gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>P. Compra</span>
                  </div>
                </th>
                <th className="text-right px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center justify-end gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    <span>P. Venta</span>
                  </div>
                </th>
                <th className="text-right px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <span>Ganancia</span>
                  </div>
                </th>
                <th className="text-center px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center px-3 sm:px-6 py-8 sm:py-12 text-sm text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => {
                  const ganancia = calcularGanancia(producto.precioVenta, producto.precioCompra);
                  const margen = calcularMargen(producto.precioVenta, producto.precioCompra);
                  
                  return (
                    <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">{producto.nombre}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{producto.codigo}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                        <span className="text-orange-700">${producto.precioCompra.toFixed(0)}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                        <span className="text-green-700">${producto.precioVenta.toFixed(0)}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                            ${ganancia.toFixed(0)}
                          </span>
                          <span className="text-xs text-gray-500">({margen}%)</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <button
                            onClick={() => openModal(producto)}
                            className="p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProducto(producto.id)}
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

      {/* Modal Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl text-gray-900">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nombre del producto</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej: Helado de Vainilla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-600"
                  placeholder="Ej: HEL-001"
                  disabled={!!editingProducto}
                />
                {editingProducto && (
                  <p className="text-xs text-gray-500 mt-1">El código no puede modificarse</p>
                )}
              </div>

              {/* Sección de Precios */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información de Precios</h3>
                
                <div className="space-y-4">
                  {/* Precio de Compra */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-orange-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                      Precio de Compra
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(e.target.value)}
                      className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-orange-700 mt-1">Costo del producto</p>
                  </div>

                  {/* Precio de Venta */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-green-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Precio de Venta
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value)}
                      className="w-full px-4 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-green-700 mt-1">Precio al público</p>
                  </div>

                  {/* Inventario */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span>
                      Inventario
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={inventario}
                      onChange={(e) => setInventario(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-600 mt-1">Cantidad inicial en inventario</p>
                  </div>

                  {/* Preview de Ganancia */}
                  {precioCompra && precioVenta && parseFloat(precioVenta) > parseFloat(precioCompra) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Ganancia estimada</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-700">
                            ${(parseFloat(precioVenta) - parseFloat(precioCompra)).toFixed(0)}
                          </div>
                          <div className="text-xs text-blue-600">
                            Margen: {calcularMargen(parseFloat(precioVenta), parseFloat(precioCompra))}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 bg-gray-50 sticky bottom-0">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white active:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProducto}
                disabled={saving}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium ${saving ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'}`}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
