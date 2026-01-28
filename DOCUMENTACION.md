# 🍦 Plataforma de Gestión de Heladería - Documentación Completa

## 📋 Descripción General

Sistema web moderno para automatizar la venta en una heladería. Diseñado para ser **rápido**, **intuitivo** y **fácil de usar** en un punto de venta real.

### Características Principales:
✅ Autenticación segura con login/logout  
✅ Dashboard intuitivo con navegación lateral  
✅ Gestión de turnos (abrir/cerrar)  
✅ Sistema de ventas con búsqueda de productos  
✅ Administración completa de productos  
✅ Componentes reutilizables y responsive  

---

## 🏗️ Arquitectura del Proyecto

```
src/app/
├── core/                          # Lógica central de la aplicación
│   ├── guards/
│   │   └── auth.guard.ts         # Guard para proteger rutas autenticadas
│   ├── models/
│   │   └── index.ts              # Interfaces y tipos de datos
│   └── services/
│       ├── auth.service.ts       # Servicio de autenticación
│       ├── turno.service.ts      # Servicio de gestión de turnos
│       ├── venta.service.ts      # Servicio de ventas
│       ├── producto.service.ts   # Servicio de productos
│       └── index.ts
├── features/                      # Módulos de funcionalidades
│   ├── auth/
│   │   └── pages/
│   │       └── login.component.ts
│   ├── dashboard/
│   │   └── layouts/
│   │       └── dashboard-layout.component.ts
│   ├── turno/
│   │   └── pages/
│   │       └── turno.component.ts
│   ├── venta/
│   │   ├── pages/
│   │   │   └── venta.component.ts
│   │   └── components/            # Componentes específicos de venta
│   └── productos/
│       ├── pages/
│       │   └── productos.component.ts
│       └── components/            # Componentes específicos de productos
├── shared/                        # Componentes reutilizables
│   └── components/
│       ├── button.component.ts    # Botón personalizado
│       ├── table.component.ts     # Tabla dinámica
│       ├── modal.component.ts     # Modal/Popup
│       └── index.ts
├── app.ts                         # Componente raíz
└── app.routes.ts                  # Configuración de rutas
```

---

## 🔐 Autenticación

### Login Component
- **Ubicación**: `src/app/features/auth/pages/login.component.ts`
- **Funcionalidad**: Pantalla inicial de autenticación
- **Campos**: Email y Contraseña
- **Validación**: Validación en tiempo real del formulario

### Auth Service
```typescript
// Login
authService.login({ email: 'user@example.com', password: 'pwd' })

// Logout
authService.logout()

// Verificar autenticación
authService.isAuthenticated()

// Obtener usuario actual
authService.getCurrentUser()
```

### Auth Guard
- Protege todas las rutas del dashboard
- Redirige a login si no está autenticado

**Datos de prueba (Demo):**
- Email: `demo@heladeria.com`
- Contraseña: Cualquier valor

---

## 🧭 Navegación y Dashboard

### Dashboard Layout
- **Ubicación**: `src/app/features/dashboard/layouts/dashboard-layout.component.ts`
- **Características**:
  - Sidebar fija con navegación
  - Información del usuario autenticado
  - Botón de logout
  - Área de contenido dinámico

### Sidebar Navigation
Acceso a tres módulos principales:
1. **⏰ Turno** - Gestión de turnos
2. **💰 Venta** - Registro de ventas
3. **📦 Productos** - Inventario de productos

---

## 📌 Módulo: Turno

### Descripción
Pantalla para gestionar el estado del turno diario del usuario.

**Ubicación**: `src/app/features/turno/pages/turno.component.ts`

### Funcionalidades

#### 1. Información del Usuario
Muestra nombre y email del usuario autenticado

#### 2. Estado del Turno
- **Badge Visual**:
  - 🟢 "Turno Abierto" (Verde) - Turno activo
  - 🔴 "Turno Cerrado" (Rojo) - Turno inactivo

#### 3. Botón Principal Dinámico
- **Si turno está CERRADO**: 
  - Texto: "🔓 Abrir Turno"
  - Color: Verde
  
- **Si turno está ABIERTO**:
  - Texto: "🔒 Cerrar Turno"
  - Color: Rojo/Naranja

#### 4. Tiempo de Apertura
Muestra la hora exacta en que se abrió el turno

### Flujo de Uso
```
1. Usuario entra al módulo
2. Ve estado actual del turno
3. Hace clic en botón para cambiar estado
4. Se muestra confirmación visual
5. Estado se actualiza en tiempo real
```

---

## 💰 Módulo: Venta

### Descripción
Sistema completo para registrar y gestionar ventas del turno actual.

**Ubicación**: `src/app/features/venta/pages/venta.component.ts`

### Componentes

#### 1. Tabla de Ventas
Muestra todas las ventas del turno actual con columnas:
- **Producto**: Nombre del producto vendido
- **Cantidad**: Unidades vendidas
- **Precio Unitario**: Precio por unidad
- **Total**: Total de la venta (cantidad × precio)
- **Fecha**: Fecha y hora de la venta
- **Acciones**: Botones Editar y Eliminar

#### 2. Botones de Acción Superior
```
[➕ Añadir Venta] [📊 Generar Excel]
```

#### 3. Modal: Añadir Venta

**Flujo:**
```
1. Usuario hace clic en "Añadir Venta"
2. Se abre modal con campos:
   - Campo de búsqueda de producto
   - Botón "Buscar" (con ícono 🔍)
   - Lista de productos sugeridos (clickeable)
   - Selector numérico para cantidad
3. Se muestra información del producto seleccionado
4. Se calcula total automáticamente
5. Usuario hace clic en "💾 Guardar Venta"
6. Modal se cierra y tabla se actualiza
```

**Campos del Modal:**
- 🔍 **Búsqueda de Producto**: Campo de texto con botón buscar
- **Productos Sugeridos**: Lista scrollable de resultados
- **Producto Seleccionado**: Información resaltada del producto elegido
- **Cantidad**: Input numérico (mínimo 1)
- **Total**: Precio unitario × cantidad (calculado automáticamente)

#### 4. Modal: Editar Venta
Permite cambiar la cantidad de una venta registrada

#### 5. Resumen de Ventas
Muestra:
- Total de ventas registradas
- Monto total recaudado

### Servicio de Ventas
```typescript
// Agregar venta
ventaService.agregarVenta(venta)

// Editar venta
ventaService.editarVenta(id, cambios)

// Eliminar venta
ventaService.eliminarVenta(id)

// Obtener ventas
ventaService.obtenerVentas()
```

---

## 📦 Módulo: Productos

### Descripción
Administración del inventario de productos disponibles para venta.

**Ubicación**: `src/app/features/productos/pages/productos.component.ts`

### Componentes

#### 1. Tabla de Productos
Columnas:
- **Nombre**: Nombre del producto
- **Código**: Código único del producto
- **Precio**: Precio de venta
- **Estado**: Activo/Inactivo
- **Acciones**: Editar y Eliminar

#### 2. Botones de Acción
```
[➕ Nuevo Producto] [📊 Generar Excel]
```

#### 3. Modal: Nuevo Producto

**Campos:**
- 📝 **Nombre**: Texto (requerido)
  - Ej: "Helado de Vainilla"
- 🔢 **Código**: Texto único (requerido)
  - Ej: "HV001"
- 💵 **Precio**: Numérico con símbolo $ (requerido)
  - Formato: $0.00

**Validaciones:**
- Nombre no puede estar vacío
- Código no puede estar vacío
- Precio debe ser mayor a 0

#### 4. Modal: Editar Producto
Mismos campos que crear + selector de estado

#### 5. Resumen
Muestra:
- Total de productos
- Cantidad de productos activos

### Productos Predeterminados
La aplicación viene con 3 productos de ejemplo:
- Helado Vainilla - $5.99
- Helado Fresa - $5.99
- Helado Chocolate - $6.49

### Servicio de Productos
```typescript
// Obtener productos
productoService.obtenerProductos()

// Agregar producto
productoService.agregarProducto({ nombre, codigo, precio })

// Editar producto
productoService.editarProducto(id, cambios)

// Eliminar producto
productoService.eliminarProducto(id)

// Buscar producto
productoService.buscarProducto(query)
```

---

## 🎨 Componentes Compartidos (Shared)

### Button Component
Botón personalizado y reutilizable

```typescript
<app-button
  label="Mi Botón"
  variant="primary|success|danger|secondary"
  [disabled]="false"
  (clicked)="miMetodo()"
></app-button>
```

**Variantes:**
- `primary` - Azul (acciones principales)
- `success` - Verde (confirmar)
- `danger` - Rojo (eliminar)
- `secondary` - Gris (acciones secundarias)

### Table Component
Tabla dinámica con soporte para acciones

```typescript
<app-table
  [columns]="columns"
  [data]="datos"
  [actions]="acciones"
></app-table>
```

**Columns Interface:**
```typescript
interface Column {
  key: string;        // Clave del objeto
  label: string;      // Etiqueta visible
  sortable?: boolean;
}
```

**Actions Interface:**
```typescript
interface TableAction {
  label: string;
  variant?: 'primary' | 'danger' | 'secondary';
  action: (row: any) => void;
}
```

### Modal Component
Modal/Popup reutilizable

```typescript
<app-modal
  title="Mi Modal"
  [isOpen]="true"
  [content]="templateRef"
  (onClose)="cerrar()"
></app-modal>

<ng-template #templateRef>
  <!-- Contenido del modal -->
</ng-template>
```

---

## 🗄️ Modelos de Datos

### Usuario
```typescript
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}
```

### Turno
```typescript
interface Turno {
  id: string;
  usuarioId: string;
  estado: 'abierto' | 'cerrado';
  fechaApertura: Date;
  fechaCierre?: Date;
}
```

### Venta
```typescript
interface Venta {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: Date;
}
```

### Producto
```typescript
interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  estado: 'activo' | 'inactivo';
}
```

---

## 🎯 Flujo de Uso Completo

### 1. Inicio de Sesión
```
Login → Ingresa credenciales → Dashboard
```

### 2. Gestor de Turno
```
Turno Cerrado → [Abrir] → Turno Abierto → [Cerrar] → Turno Cerrado
```

### 3. Registro de Venta
```
[Añadir Venta] → Busca Producto → Selecciona → Cantidad → [Guardar]
                  → Venta en tabla → Puede editar o eliminar
```

### 4. Gestión de Productos
```
[Nuevo Producto] → Ingresa datos → [Guardar]
                 → Producto en tabla → Puede editar o eliminar
```

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Primario**: #667eea (Púrpura/Azul)
- **Secundario**: #764ba2 (Púrpura oscuro)
- **Éxito**: #28a745 (Verde)
- **Peligro**: #dc3545 (Rojo)
- **Advertencia**: #ffc107 (Amarillo)
- **Neutral**: #6c757d (Gris)

### Tipografía
- **Fuente**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Tamaños**: Escalable y responsive

### Efectos de Interacción
- ✨ Hover con elevación
- 📱 Animaciones suaves (0.3s)
- 🎯 Estados clara de botones
- ✓ Feedback visual en acciones

---

## 💾 Almacenamiento de Datos

### LocalStorage (Simulación)
Los datos se guardan en localStorage del navegador:
- `auth_token` - Token de autenticación
- `auth_usuario` - Datos del usuario
- `turno_actual` - Turno activo
- `ventas` - Lista de ventas
- `productos` - Inventario de productos

**Nota**: En producción, estos datos deben consumirse desde un backend real.

---

## 🚀 Configuración e Instalación

### Requisitos
- Node.js 18+
- Angular 17+
- npm o yarn

### Pasos de Instalación
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start

# o usando Angular CLI
ng serve

# 3. Abrir en navegador
http://localhost:4200
```

### Comandos Disponibles
```bash
# Desarrollo
npm start              # Inicia servidor dev

# Build
npm run build         # Build de producción

# Testing
npm test              # Ejecuta pruebas
```

---

## 🔧 Personalización

### Cambiar Colores
Editar variables de color en estilos de componentes:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Agregar Nuevo Módulo
1. Crear carpeta en `src/app/features`
2. Crear estructura: `pages/` y `components/`
3. Crear componente principal
4. Agregar ruta en `app.routes.ts`
5. Agregar link en sidebar

### Conectar Backend Real
1. Inyectar `HttpClient`
2. Reemplazar Observables de Mock con llamadas HTTP
3. Usar interceptores para token

```typescript
// Ejemplo:
this.http.post('/api/login', credentials)
```

---

## 📝 Notas Importantes

### 🎯 Para Desarrolladores
- Los servicios simulan datos en localStorage
- El auth es básico (solo valida presencia de datos)
- La generación de Excel está como placeholder
- Los componentes son standalone (Angular 17+)

### 🔐 Seguridad
- En producción: Usar tokens JWT reales
- En producción: HTTPS y CORS configurado
- En producción: Validación en backend

### 📱 Responsiveness
- Diseño adaptable a dispositivos móviles
- Sidebar se puede hacer colapsible en móvil
- Tabla es scrollable en pantallas pequeñas

---

## ✅ Checklist de Características

- [x] Login/Logout
- [x] Dashboard con sidebar
- [x] Módulo Turno (abrir/cerrar)
- [x] Módulo Venta (CRUD completo)
- [x] Búsqueda de productos en venta
- [x] Módulo Productos (CRUD completo)
- [x] Componentes reutilizables
- [x] Guards de autenticación
- [x] Servicios con lógica de negocio
- [x] Estilos moderno y profesional
- [x] Animaciones y transiciones
- [x] Validación de formularios
- [x] Feedback visual (success/error)
- [x] Modales/Popups funcionales
- [x] Tablas dinámicas con acciones
- [ ] Exportar a Excel (placeholder)
- [ ] Reportes avanzados
- [ ] Sincronización en tiempo real
- [ ] Notificaciones push

---

## 📞 Soporte y Contribuciones

Para reportar bugs o sugerir mejoras, por favor abre un issue o contacta al equipo de desarrollo.

**Versión**: 1.0.0  
**Última actualización**: Enero 2026  
**Desarrollador**: Sistema de Heladería ❄️
