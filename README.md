# 🍦 Plataforma de Gestión de Heladería

Aplicación web moderna para automatizar la venta en una heladería. Sistema intuitivo, rápido y diseñado para usuarios no técnicos en un punto de venta.

## ✨ Características Principales

- 🔐 **Autenticación segura** - Login/Logout con validación
- 📊 **Dashboard intuitivo** - Navegación clara con sidebar
- ⏰ **Gestión de turnos** - Abrir y cerrar turnos diarios
- 💰 **Sistema de ventas** - Registro, edición y eliminación de ventas
- 📦 **Gestión de productos** - CRUD completo del inventario
- 🎨 **Diseño moderno** - Interfaz limpia, responsive y profesional
- ⚡ **Componentes reutilizables** - Botones, tablas, modales
- 📱 **Responsive Design** - Funciona en desktop y tablet

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+
- npm o yarn

### Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:4200/`

### Credenciales de Prueba
- **Email**: `demo@heladeria.com`
- **Contraseña**: Cualquier valor

## 📖 Documentación

Para información detallada sobre la arquitectura, componentes y cómo usar cada módulo, consulta [DOCUMENTACION.md](./DOCUMENTACION.md)

### Estructura Rápida
```
src/app/
├── core/              # Servicios, guards, modelos
├── features/          # Módulos de funcionalidades
│   ├── auth/         # Login
│   ├── dashboard/    # Layout principal
│   ├── turno/        # Gestión de turnos
│   ├── venta/        # Sistema de ventas
│   └── productos/    # Inventario
└── shared/           # Componentes reutilizables
```

## 🎯 Módulos Principales

### 1️⃣ Turno
Gestiona el estado del turno diario:
- Visualizar estado actual (Abierto/Cerrado)
- Abrir nuevo turno
- Cerrar turno con confirmación

### 2️⃣ Venta
Sistema completo de registro de ventas:
- Tabla de ventas del turno
- Búsqueda de productos
- Edición y eliminación de ventas
- Resumen de totales

### 3️⃣ Productos
Administración del inventario:
- Crear nuevos productos
- Editar información
- Eliminar productos
- Estado de disponibilidad

## 🎨 Tecnologías Utilizadas

- **Angular 17+** - Framework frontend
- **TypeScript** - Lenguaje de programación
- **RxJS** - Gestión de estado reactivo
- **CSS3** - Estilos modernos
- **LocalStorage** - Persistencia de datos (demo)

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
