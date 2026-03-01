# Documentación: Endpoint de Actualización de Ventas (PATCH /sales/:id)

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Especificaciones Técnicas](#especificaciones-técnicas)
3. [Autenticación](#autenticación)
4. [Request Body](#request-body)
5. [Response](#response)
6. [Códigos de Estado](#códigos-de-estado)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Validaciones y Restricciones](#validaciones-y-restricciones)
9. [Casos de Error](#casos-de-error)
10. [Ejemplos de Código Frontend](#ejemplos-de-código-frontend)

---

## Descripción General

Este endpoint permite actualizar los datos de una venta, incluyendo su estado, método de pago, y los detalles de los productos vendidos. Proporciona capacidades completas de CRUD para los detalles de ventas (crear, leer, actualizar, eliminar).

**Características principales:**
- Actualizar estado y método de pago de la venta
- Agregar nuevos productos a la venta
- Modificar cantidades y productos existentes
- Eliminar productos que no se envíen en la solicitud
- Gestión automática de inventario
- Recálculo automático del total de venta

---

## Especificaciones Técnicas

| Propiedad | Valor |
|-----------|-------|
| **Método HTTP** | `PATCH` |
| **URL** | `/sales/:id` |
| **Versión API** | v1 |
| **Content-Type** | `application/json` |
| **Autenticación** | JWT Bearer Token |
| **Base URL** | `http://localhost:3000` |

**URL Completa (ejemplo):**
```
PATCH http://localhost:3000/sales/39b06db5-d64b-4e5e-9e83-945f393c9888
```

---

## Autenticación

El endpoint requiere autenticación mediante JWT Bearer Token.

### Header Requerido:
```
Authorization: Bearer <tu_jwt_token>
```

### Cómo obtener el token:

1. Realizar login en `/auth/login`:
```json
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "tu_contraseña"
}
```

2. La respuesta incluirá:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "detail": { ... }
}
```

3. Usar el `access_token` en todas las solicitudes posteriores.

---

## Request Body

### Estructura General

```json
{
  "estado": "pagada",
  "metodo_pago": "efectivo",
  "items": [
    {
      "id": "uuid-del-detalle-existente",
      "productId": 1,
      "cantidad": 5
    },
    {
      "productId": 2,
      "cantidad": 3
    }
  ]
}
```

### Campos Principales

#### 1. **estado** (Opcional)
- **Tipo:** String (Enum)
- **Valores permitidos:** `"pendiente"`, `"pagada"`, `"cancelada"`
- **Descripción:** Estado de la venta
- **Restricción:** No se puede actualizar una venta cancelada
- **Ejemplo:**
  ```json
  "estado": "pagada"
  ```

#### 2. **metodo_pago** (Opcional)
- **Tipo:** String (Enum)
- **Valores permitidos:** `"efectivo"`, `"tarjeta"`, `"transferencia"`, `"otro"`
- **Descripción:** Método de pago utilizado
- **Ejemplo:**
  ```json
  "metodo_pago": "tarjeta"
  ```

#### 3. **items** (Opcional)
- **Tipo:** Array de objetos `UpdateSaleDetailDto`
- **Descripción:** Lista de detalles de la venta. Si se proporciona, reemplaza todos los detalles existentes.
- **Comportamiento especial:**
  - Si un objeto tiene `id`, se actualiza el detalle existente
  - Si un objeto NO tiene `id`, se crea un nuevo detalle
  - Los detalles existentes NO incluidos en `items` serán eliminados
  - Si no se proporciona `items`, los detalles no se modifican

#### 3.1 Detalle de Venta (UpdateSaleDetailDto)

```json
{
  "id": "uuid-opcional",
  "productId": 1,
  "cantidad": 5
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|----------|-------------|
| `id` | String (UUID) | No | UUID del detalle existente. Omitir para crear uno nuevo |
| `productId` | Number | Sí (para nuevos) | ID del producto (entero) |
| `cantidad` | Number | Sí (para nuevos) | Cantidad del producto (mínimo 1) |

---

## Response

### Respuesta Exitosa (200 OK)

```json
{
  "id": "39b06db5-d64b-4e5e-9e83-945f393c9888",
  "fecha": "2026-02-28T19:45:01.542Z",
  "total_venta": "16000.00",
  "metodo_pago": "efectivo",
  "estado": "pagada",
  "createdAt": "2026-02-28T19:45:01.579Z",
  "updatedAt": "2026-02-28T20:15:30.123Z",
  "userId": "042537e5-5494-4db2-8ddb-18e4ff1a455a",
  "saleDetails": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "cantidad": 4,
      "precio_unitario": 2000,
      "subtotal": "8000.00",
      "createdAt": "2026-02-28T19:45:01.789Z",
      "updatedAt": "2026-02-28T20:15:30.456Z",
      "saleId": "39b06db5-d64b-4e5e-9e83-945f393c9888",
      "productId": 1,
      "product": {
        "id": 1,
        "nombre": "helado cono blandito",
        "precioCompra": 1400,
        "precioVenta": 2000,
        "codigo": "1",
        "inventario": 7,
        "createdAt": "2026-02-28T19:11:42.348Z",
        "updatedAt": "2026-02-28T20:15:30.200Z",
        "userId": "042537e5-5494-4db2-8ddb-18e4ff1a455a"
      }
    },
    {
      "id": "660f9511-f40c-52e5-b827-557766551111",
      "cantidad": 4,
      "precio_unitario": 2000,
      "subtotal": "8000.00",
      "createdAt": "2026-02-28T20:15:30.100Z",
      "updatedAt": "2026-02-28T20:15:30.456Z",
      "saleId": "39b06db5-d64b-4e5e-9e83-945f393c9888",
      "productId": 1,
      "product": {
        "id": 1,
        "nombre": "helado cono blandito",
        "precioCompra": 1400,
        "precioVenta": 2000,
        "codigo": "1",
        "inventario": 7,
        "createdAt": "2026-02-28T19:11:42.348Z",
        "updatedAt": "2026-02-28T20:15:30.200Z",
        "userId": "042537e5-5494-4db2-8ddb-18e4ff1a455a"
      }
    }
  ]
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único de la venta |
| `fecha` | ISO 8601 | Fecha y hora de la venta |
| `total_venta` | Decimal | Total recalculado automáticamente |
| `metodo_pago` | String | Método de pago actualizado |
| `estado` | String | Estado actualizado |
| `createdAt` | ISO 8601 | Fecha de creación |
| `updatedAt` | ISO 8601 | Fecha de última actualización |
| `userId` | UUID | ID del usuario propietario |
| `saleDetails` | Array | Detalles de la venta con productos |

---

## Códigos de Estado

| Código | Estado | Descripción |
|--------|--------|-------------|
| `200` | OK | Venta actualizada exitosamente |
| `400` | Bad Request | Validación fallida, revisar mensaje de error |
| `401` | Unauthorized | Token JWT inválido o expirado |
| `404` | Not Found | Venta con ID especificado no existe |
| `500` | Internal Server Error | Error del servidor |

---

## Ejemplos de Uso

### Caso 1: Cambiar solo el estado

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "estado": "pagada"
}
```

**Resultado:** La venta cambia a estado "pagada", los detalles no se modifican.

---

### Caso 2: Cambiar estado y método de pago

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "estado": "pagada",
  "metodo_pago": "tarjeta"
}
```

**Resultado:** Se actualiza estado y método de pago, detalles sin cambios.

---

### Caso 3: Actualizar cantidad de un detalle existente

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "cantidad": 10
    },
    {
      "id": "660f9511-f40c-52e5-b827-557766551111",
      "cantidad": 5
    }
  ]
}
```

**Resultado:**
- Detalle 1: cantidad actualizada a 10
- Detalle 2: cantidad actualizada a 5
- Total recalculado automáticamente
- Inventario ajustado según cambios

---

### Caso 4: Agregar un nuevo producto a la venta

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "cantidad": 4
    },
    {
      "productId": 2,
      "cantidad": 3
    }
  ]
}
```

**Resultado:**
- Mantiene detalle 1 con cantidad 4
- Agrega nuevo detalle con producto 2
- Total recalculado

---

### Caso 5: Actualizar y eliminar detalles

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "cantidad": 6
    }
  ]
}
```

**Resultado:**
- Mantiene y actualiza solo el detalle con ID especificado
- Otros detalles existentes son ELIMINADOS
- Inventario se restaura para los productos eliminados

---

### Caso 6: Cambio completo (estado, pago, productos)

```json
PATCH /sales/39b06db5-d64b-4e5e-9e83-945f393c9888

{
  "estado": "pagada",
  "metodo_pago": "transferencia",
  "items": [
    {
      "productId": 1,
      "cantidad": 2
    },
    {
      "productId": 3,
      "cantidad": 5
    }
  ]
}
```

**Resultado:**
- Estado: pagada
- Método de pago: transferencia
- Todos los detalles anteriores se reemplazan con los 2 nuevos
- Total recalculado: (2 × precio_producto_1) + (5 × precio_producto_3)

---

## Validaciones y Restricciones

### Validaciones de Estado
- ✅ El **estado** debe ser uno de: `"pendiente"`, `"pagada"`, `"cancelada"`
- ❌ No se puede actualizar una venta que ya está `"cancelada"`
- ❌ Se activa automaticamente la restauración de inventario si cambia a `"cancelada"` desde `"pagada"`

### Validaciones de Método de Pago
- ✅ Debe ser uno de: `"efectivo"`, `"tarjeta"`, `"transferencia"`, `"otro"`

### Validaciones de Detalles
- ✅ `productId` debe ser un número entero válido
- ✅ `cantidad` debe ser un número mínimo de 1
- ✅ El producto debe pertenecer al mismo usuario
- ✅ Debe haber inventario suficiente
- ❌ No se acepta un array vacío para `items` (omitir si no desea cambiar)

### Restricciones de Inventario
- El inventario se **disminuye** cuando se agregan/aumentan detalles
- El inventario se **restaura** cuando se eliminan/disminuyen detalles
- Si cambia el producto en un detalle, primero se restaura del antiguo y luego se descuenta del nuevo

---

## Casos de Error

### Error 1: Venta no existe

```json
HTTP/1.1 404 Not Found

{
  "message": "Venta con ID 00000000-0000-0000-0000-000000000000 no encontrada",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### Error 2: Venta cancelada no se puede actualizar

```json
HTTP/1.1 400 Bad Request

{
  "message": "No se puede actualizar una venta cancelada",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Error 3: Inventario insuficiente

```json
HTTP/1.1 400 Bad Request

{
  "message": "Inventario insuficiente para el producto helado cono blandito. Disponible: 5, Solicitado: 10",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Error 4: Producto no pertenece al usuario

```json
HTTP/1.1 400 Bad Request

{
  "message": "El producto helado cono blandito no pertenece a este usuario",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Error 5: Detalle de venta no encontrado

```json
HTTP/1.1 400 Bad Request

{
  "message": "Detalle de venta con ID 00000000-0000-0000-0000-000000000000 no encontrado",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### Error 6: Token JWT inválido

```json
HTTP/1.1 401 Unauthorized

{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

### Error 7: Estado inválido

```json
HTTP/1.1 400 Bad Request

{
  "message": [
    "estado must be one of the following values: pendiente, pagada, cancelada"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Ejemplos de Código Frontend

### JavaScript / TypeScript (Fetch API)

```typescript
// 1. Obtener el token del almacenamiento local (asumiendo que fue guardado después del login)
const token = localStorage.getItem('authToken');

// 2. Preparar los datos
const saleId = '39b06db5-d64b-4e5e-9e83-945f393c9888';
const updateData = {
  estado: 'pagada',
  metodo_pago: 'tarjeta',
  items: [
    {
      productId: 1,
      cantidad: 5
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      cantidad: 3
    }
  ]
};

// 3. Realizar la solicitud
try {
  const response = await fetch(`http://localhost:3000/sales/${saleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error:', errorData.message);
    throw new Error(errorData.message);
  }

  const updatedSale = await response.json();
  console.log('Venta actualizada:', updatedSale);
  return updatedSale;
} catch (error) {
  console.error('Error al actualizar venta:', error);
}
```

---

### React Hook (Custom Hook)

```typescript
import { useState, useCallback } from 'react';

interface UpdateSaleDetailInput {
  id?: string;
  productId?: number;
  cantidad?: number;
}

interface UpdateSaleInput {
  estado?: 'pendiente' | 'pagada' | 'cancelada';
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
  items?: UpdateSaleDetailInput[];
}

export const useUpdateSale = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSale = useCallback(
    async (saleId: string, data: UpdateSaleInput) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch(
          `http://localhost:3000/sales/${saleId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al actualizar venta');
        }

        const updatedSale = await response.json();
        return updatedSale;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateSale, loading, error };
};

// Uso en componente
export const UpdateSaleComponent = () => {
  const { updateSale, loading, error } = useUpdateSale();

  const handleUpdateSale = async () => {
    try {
      const result = await updateSale('39b06db5-d64b-4e5e-9e83-945f393c9888', {
        estado: 'pagada',
        items: [
          { productId: 1, cantidad: 5 }
        ]
      });
      console.log('Éxito:', result);
    } catch (err) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleUpdateSale} disabled={loading}>
        {loading ? 'Actualizando...' : 'Actualizar Venta'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

---

### Axios (TypeScript)

```typescript
import axios, { AxiosInstance } from 'axios';

interface UpdateSaleDetailInput {
  id?: string;
  productId?: number;
  cantidad?: number;
}

interface UpdateSaleInput {
  estado?: 'pendiente' | 'pagada' | 'cancelada';
  metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
  items?: UpdateSaleDetailInput[];
}

class SalesService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para agregar el token en todas las solicitudes
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async updateSale(saleId: string, data: UpdateSaleInput) {
    try {
      const response = await this.api.patch(`/sales/${saleId}`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
}

// Uso
const salesService = new SalesService();

const updateSale = async () => {
  try {
    const result = await salesService.updateSale(
      '39b06db5-d64b-4e5e-9e83-945f393c9888',
      {
        estado: 'pagada',
        metodo_pago: 'tarjeta',
        items: [
          { productId: 1, cantidad: 5 }
        ]
      }
    );
    console.log('Venta actualizada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### Python (Requests)

```python
import requests
from typing import Optional, List, Dict, Any

class SalesService:
    def __init__(self, base_url: str = 'http://localhost:3000'):
        self.base_url = base_url
        self.token: Optional[str] = None

    def set_token(self, token: str):
        """Establecer el token JWT"""
        self.token = token

    def update_sale(
        self,
        sale_id: str,
        estado: Optional[str] = None,
        metodo_pago: Optional[str] = None,
        items: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Actualizar una venta
        
        Args:
            sale_id: ID de la venta
            estado: 'pendiente', 'pagada', o 'cancelada'
            metodo_pago: 'efectivo', 'tarjeta', 'transferencia', u 'otro'
            items: Lista de detalles de venta
        
        Returns:
            Datos de la venta actualizada
        """
        url = f'{self.base_url}/sales/{sale_id}'
        
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        data = {}
        if estado:
            data['estado'] = estado
        if metodo_pago:
            data['metodo_pago'] = metodo_pago
        if items is not None:
            data['items'] = items
        
        response = requests.patch(url, json=data, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(f"Error {response.status_code}: {error_data.get('message')}")
        
        return response.json()


# Uso
service = SalesService()
service.set_token('tu_jwt_token_aqui')

try:
    result = service.update_sale(
        sale_id='39b06db5-d64b-4e5e-9e83-945f393c9888',
        estado='pagada',
        metodo_pago='tarjeta',
        items=[
            {'productId': 1, 'cantidad': 5},
            {'id': '550e8400-e29b-41d4-a716-446655440000', 'cantidad': 3}
        ]
    )
    print('Venta actualizada:', result)
except Exception as e:
    print(f'Error: {e}')
```

---

### cURL

```bash
# Ejemplo básico
curl -X PATCH http://localhost:3000/sales/39b06db5-d64b-4e5e-9e83-945f393c9888 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "estado": "pagada",
    "metodo_pago": "tarjeta",
    "items": [
      {
        "productId": 1,
        "cantidad": 5
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "cantidad": 3
      }
    ]
  }'
```

---

## Flujos de Trabajo Recomendados

### Flujo 1: Cambiar solo estado

```
1. Usuario selecciona nueva venta de lista
2. Frontend obtiene detalles actuales
3. Usuario cambia estado en dropdown
4. Frontend llama: PATCH /sales/{id} { estado: "pagada" }
5. Mostrar confirmación y actualizar UI
```

### Flujo 2: Editar detalles de venta

```
1. Usuario abre editor de venta
2. Carga detalles actuales desde el último GET /sales/{id}
3. Usuario:
   - Modifica cantidad de producto existente (necesita ID del detalle)
   - Agrega nuevo producto (sin ID)
   - Elimina un producto (no incluir en items)
4. Frontend envía: PATCH /sales/{id} { items: [...] }
5. Recibir detalles actualizados con total recalculado
```

### Flujo 3: Cambio integral

```
1. Usuario abre formulario completo de venta
2. Modifica:
   - Estado
   - Método de pago
   - Productos y cantidades
3. Frontend valida localmente
4. Envía: PATCH /sales/{id} { estado, metodo_pago, items }
5. Maneja errores según validaciones del backend
6. Actualiza datos y muestra confirmación
```

---

## Notas Importantes

### ⚠️ Gestión de Inventario Automática
- El backend **NUNCA** disminuye inventario al crear una venta si se proporciona `items`
- El inventario se ajusta automáticamente en cada actualización
- Ejemplo: Si reduce cantidad de 10 a 5, se restauran 5 unidades

### ⚠️ Eliminación de Detalles
- Si envía `items` con solo algunos detalles, los otros se **ELIMINAN PERMANENTEMENTE**
- El inventario se restaura automáticamente para los productos eliminados
- Siempre incluya todos los detalles que desea mantener

### 💡 Cálculo de Total
- El `total_venta` se calcula automáticamente como la suma de todos los `subtotal` de detalles
- No es necesario enviarlo en la solicitud
- Se devuelve actualizado en la respuesta

### 💡 Timestamps
- `createdAt` nunca cambia (fecha de creación de la venta)
- `updatedAt` se actualiza con cada cambio
- Cada detalle también tiene sus propios `createdAt` y `updatedAt`

### 🔒 Seguridad
- Solo el usuario propietario puede actualizar sus ventas
- Los productos deben pertenecer al mismo usuario
- Validación en backend previene acceso no autorizado

---

## Preguntas Frecuentes

**P: ¿Puedo cambiar la fecha de la venta?**
A: No, la fecha se establece solo al crear. Usa `actualizar estado/detalles` para modificar la venta.

**P: ¿Qué sucede si intento agregar un producto que no existe?**
A: Recibirás error 404 "Producto con ID X no encontrado".

**P: ¿Puedo tener una venta sin detalles?**
A: No, debe haber al menos un detalle. Si todos se eliminan, la venta quedará vacía (considera el caso de uso).

**P: ¿El inventario se restaura si cancelo la venta?**
A: Solo si estaba en estado "pagada" y cambias a "cancelada". De "pendiente" a "cancelada" no restaura (considerada no consumida).

**P: ¿Puedo actualizar solo el método de pago sin tocar detalles?**
A: Sí, solo envía `{ metodo_pago: "tarjeta" }` sin incluir `items`.

---

## Soporte

Para errores o preguntas, verifica:
1. El token JWT es válido y no ha expirado
2. El ID de la venta existe y es correcto
3. Los productos pertenecen al usuario autenticado
4. Hay inventario suficiente para los cambios
5. El estado de la venta no es "cancelada"

**Contacto:** Equipo de Backend
