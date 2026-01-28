import { useState, useEffect } from 'react';
import { Plus, FileSpreadsheet, Edit, Trash2, X } from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
}

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precio, setPrecio] = useState('');

  useEffect(() => {
    // Cargar productos desde localStorage
    const savedProductos = localStorage.getItem('productos');
    if (savedProductos) {
      setProductos(JSON.parse(savedProductos));
    } else {
      // Datos de ejemplo iniciales
      const ejemplos = [
        { id: '1', nombre: 'Helado de Vainilla', codigo: 'HEL-001', precio: 3500 },
        { id: '2', nombre: 'Helado de Chocolate', codigo: 'HEL-002', precio: 3500 },
        { id: '3', nombre: 'Helado de Fresa', codigo: 'HEL-003', precio: 3500 },
      ];
      setProductos(ejemplos);
      localStorage.setItem('productos', JSON.stringify(ejemplos));
    }
  }, []);

  const handleSaveProducto = () => {
    if (!nombre.trim() || !codigo.trim() || !precio) {
      alert('Por favor complete todos los campos');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      alert('Ingrese un precio válido');
      return;
    }

    const newProducto: Producto = {
      id: editingProducto?.id || Date.now().toString(),
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      precio: precioNum,
    };

    let updatedProductos;
    if (editingProducto) {
      updatedProductos = productos.map((p) => (p.id === editingProducto.id ? newProducto : p));
    } else {
      // Verificar que no exista el código
      if (productos.some((p) => p.codigo === newProducto.codigo)) {
        alert('Ya existe un producto con ese código');
        return;
      }
      updatedProductos = [...productos, newProducto];
    }

    setProductos(updatedProductos);
    localStorage.setItem('productos', JSON.stringify(updatedProductos));
    
    closeModal();
  };

  const handleDeleteProducto = (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      const updatedProductos = productos.filter((p) => p.id !== id);
      setProductos(updatedProductos);
      localStorage.setItem('productos', JSON.stringify(updatedProductos));
    }
  };

  const openModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setNombre(producto.nombre);
      setCodigo(producto.codigo);
      setPrecio(producto.precio.toString());
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setNombre('');
    setCodigo('');
    setPrecio('');
  };

  const generateExcel = () => {
    // Simulación de generación de Excel
    alert('Funcionalidad de exportación a Excel - En producción se generaría un archivo descargable');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-sm sm:text-base text-gray-600">Administre el catálogo de productos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center sm:justify-start gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
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
                <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Código</th>
                <th className="text-right px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Precio</th>
                <th className="text-center px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center px-4 sm:px-6 py-12 text-sm sm:text-base text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 truncate">{producto.nombre}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{producto.codigo}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-right font-semibold text-gray-900">
                      ${producto.precio.toFixed(0)}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() => openModal(producto)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProducto(producto.id)}
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

      {/* Modal Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[calc(90vh-200px)] sm:max-h-none overflow-y-auto sm:overflow-visible">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
                  placeholder="Ej: Helado de Vainilla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Código</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ej: HEL-001"
                  disabled={!!editingProducto}
                />
                {editingProducto && (
                  <p className="text-xs text-gray-500 mt-1">El código no puede modificarse</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Precio</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProducto}
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