# 🚀 Guía Rápida de Uso - Sistema de Heladería

## 🔑 Paso 1: Iniciar Sesión

1. Abre la aplicación en `http://localhost:4200/`
2. Verás la pantalla de Login
3. Ingresa credenciales:
   - Email: `demo@heladeria.com`
   - Contraseña: Cualquier texto
4. Haz clic en **"Iniciar Sesión"**

✅ Serás redirigido al Dashboard

---

## 📍 Paso 2: Explorar el Dashboard

Una vez autenticado, verás:

```
┌─────────────────────────────────────────────┐
│ 🍦 Control Heladería                        │
├─────────────┬───────────────────────────────┤
│ ⏰ Turno    │                               │
│ 💰 Venta    │    CONTENIDO PRINCIPAL        │
│ 📦 Productos│                               │
│             │                               │
│ [Usuario]   │                               │
│ [Logout]    │                               │
└─────────────┴───────────────────────────────┘
```

### Componentes Principales:
- **Sidebar izquierda**: Navegación entre módulos
- **Área principal**: Contenido del módulo seleccionado
- **Información de usuario**: Muestra nombre y email
- **Botón Logout**: Para cerrar sesión

---

## ⏰ Paso 3: Gestionar Turno

### Acceder al módulo
1. Haz clic en **⏰ Turno** en la sidebar

### Pantalla de Turno
Verás:
- Nombre del usuario (Ej: "Juan Pérez")
- **Estado del Turno**: 🔴 Cerrado
- **Botón**: "🔓 Abrir Turno" (verde)

### Abrir Turno
1. Haz clic en **"🔓 Abrir Turno"**
2. El botón cambia a **"🔒 Cerrar Turno"** (rojo)
3. El badge cambia a **🟢 Turno Abierto**

### Cerrar Turno
1. Haz clic en **"🔒 Cerrar Turno"**
2. Se pedirá confirmación
3. El turno se cierra
4. Vuelve al estado "🔴 Cerrado"

⚠️ **Nota**: No puedes registrar ventas sin turno abierto

---

## 💰 Paso 4: Registrar Ventas

### Acceder al módulo
1. Haz clic en **💰 Venta** en la sidebar
2. Debes tener un turno abierto (ver paso 3)

### Interfaz de Ventas
Verás:
- **Tabla de Ventas**: Historial de ventas del turno
- **Botones superiores**: [➕ Añadir Venta] [📊 Generar Excel]
- **Resumen**: Total de ventas y monto recaudado

### Agregar una Venta

#### Paso A: Abrir Modal
1. Haz clic en **[➕ Añadir Venta]**
2. Se abre un modal/popup

#### Paso B: Buscar Producto
1. En el campo "Buscar Producto", escribe:
   - Nombre (Ej: "Helado")
   - O Código (Ej: "HV001")
2. Haz clic en **[🔍 Buscar]**
3. Verás lista de productos encontrados

#### Paso C: Seleccionar Producto
1. Haz clic en el producto de la lista
2. Se destacará como "Producto Seleccionado"
3. Se muestra: Nombre, Código, Precio

#### Paso D: Ingresar Cantidad
1. En el campo "Cantidad", ingresa un número (Ej: 2)
2. Verás el **Total** calculado automáticamente
   - Ejemplo: Precio $5.99 × Cantidad 2 = **$11.98**

#### Paso E: Guardar Venta
1. Haz clic en **[💾 Guardar Venta]**
2. El modal se cierra
3. La venta aparece en la tabla

### Ver Tabla de Ventas
La tabla muestra:
| Producto | Cantidad | Precio Unit. | Total | Fecha | Acciones |
|----------|----------|--------------|-------|-------|----------|
| Helado Vainilla | 2 | $5.99 | $11.98 | 14:30:45 | ✏️ 🗑️ |

### Editar Venta
1. Busca la venta en la tabla
2. Haz clic en **[✏️ Editar]**
3. Se abre modal para cambiar cantidad
4. Ajusta la cantidad
5. Haz clic en **[💾 Guardar Cambios]**

### Eliminar Venta
1. Busca la venta en la tabla
2. Haz clic en **[🗑️ Eliminar]**
3. Se pide confirmación
4. Venta se elimina de la tabla

### Ver Resumen
Al final, ves:
- **Total Ventas**: Cantidad de ventas registradas
- **Monto Total**: Suma de todos los totales

---

## 📦 Paso 5: Gestionar Productos

### Acceder al módulo
1. Haz clic en **📦 Productos** en la sidebar

### Interfaz de Productos
- **Tabla de Productos**: Lista de todos los productos
- **Botones**: [➕ Nuevo Producto] [📊 Generar Excel]
- **Resumen**: Total de productos y activos

### Crear Nuevo Producto

#### Paso A: Abrir Modal
1. Haz clic en **[➕ Nuevo Producto]**

#### Paso B: Ingresar Datos
- **Nombre**: Ej: "Helado de Fresa"
- **Código**: Ej: "HF002" (debe ser único)
- **Precio**: Ej: "5.99" (con simbolo $)

#### Paso C: Guardar
1. Haz clic en **[💾 Guardar Producto]**
2. Producto aparece en la tabla

### Ver Tabla de Productos
| Nombre | Código | Precio | Estado | Acciones |
|--------|--------|--------|--------|----------|
| Helado Vainilla | HV001 | $5.99 | Activo | ✏️ 🗑️ |

### Editar Producto

1. Haz clic en **[✏️ Editar]** en la fila del producto
2. Se abre modal con datos actuales
3. Modifica:
   - Nombre
   - Código
   - Precio
   - Estado (Activo/Inactivo)
4. Haz clic en **[💾 Guardar Cambios]**

### Eliminar Producto

1. Haz clic en **[🗑️ Eliminar]**
2. Se pide confirmación
3. Producto se elimina

⚠️ **Advertencia**: Los productos eliminados no se pueden recuperar

---

## 🎯 Flujo Completo de Uso

```
1. LOGIN
   └─ Email + Contraseña → Dashboard

2. ABRIR TURNO
   └─ ⏰ Turno → [Abrir Turno] → Turno Abierto ✅

3. REGISTRAR VENTA
   └─ 💰 Venta → [Añadir Venta]
      └─ Buscar Producto → Seleccionar → Cantidad
         └─ [Guardar] → Venta en tabla

4. GESTIONAR INVENTARIO (Opcional)
   └─ 📦 Productos → [Nuevo Producto]
      └─ Ingresar datos → [Guardar] → Producto en tabla

5. CERRAR TURNO
   └─ ⏰ Turno → [Cerrar Turno] → Turno Cerrado

6. LOGOUT
   └─ Botón [Cerrar Sesión] en sidebar
```

---

## 💡 Tips y Trucos

### ⚡ Accesos Rápidos
- Presiona **Tab** para navegar entre campos
- Presiona **Enter** en el modal para guardar
- **Esc** cierra modales

### 📝 Validaciones
- Los campos requeridos no pueden estar vacíos
- El precio debe ser mayor a 0
- Los códigos de producto deben ser únicos

### 🔄 Datos Persistentes
- Los datos se guardan automáticamente en el navegador
- Si cierras el navegador, los datos se conservan
- Los datos se limpian al hacer logout

### 🎨 Personalización
- Diferentes colores indican diferentes estados
- 🟢 Verde = Activo/Éxito
- 🔴 Rojo = Cerrado/Eliminar
- 🔵 Azul = Acciones principales

---

## ❓ Preguntas Frecuentes

**P: ¿Qué sucede si cierro el navegador?**
R: Los datos se guardan en LocalStorage y se recuperan al reiniciar.

**P: ¿Puedo eliminar un turno?**
R: No directamente. Solo puedes abrirlo y cerrarlo. El historial se mantiene.

**P: ¿Dónde se exportan los datos a Excel?**
R: La función está en desarrollo. Próximamente disponible.

**P: ¿Cuál es la contraseña correcta?**
R: Para la demo, cualquier contraseña funciona. En producción será validada en backend.

**P: ¿Puedo editar el turno?**
R: No. Solo puedes cambiar su estado entre abierto/cerrado.

---

## 🆘 Solución de Problemas

### El login no funciona
- Verifica que el email sea válido
- Intenta con: `demo@heladeria.com`
- La contraseña puede ser cualquier cosa

### Las ventas no se guardan
- Asegúrate de tener un turno abierto
- Verifica haber seleccionado un producto
- La cantidad debe ser mayor a 0

### No veo productos
- Hay 3 productos predeterminados
- Crea nuevos productos en el módulo 📦 Productos
- Los productos deben tener estado "Activo"

### El modal no se cierra
- Haz clic fuera del modal en el fondo gris
- O haz clic en el botón [X] en la esquina superior derecha
- O haz clic en [Cancelar]

---

## 📱 Uso en Dispositivos Móviles

La aplicación es responsive y funciona en:
- ✅ Tablet (iPad, Android tablets)
- ⚠️ Móvil (pantalla pequeña, pero usable)

**Recomendación**: Usa en tablet o desktop para mejor experiencia en punto de venta.

---

## 🚀 Próximas Características

- [ ] Exportar ventas a Excel
- [ ] Reportes diarios/mensuales
- [ ] Gráficos de ventas
- [ ] Multi-usuario simultáneo
- [ ] Sincronización en la nube
- [ ] App móvil nativa
- [ ] Código QR para productos
- [ ] Devoluciones y cambios

---

**¡Gracias por usar Sistema de Heladería! ❄️🍦**
