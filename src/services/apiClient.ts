/**
 * Cliente HTTP centralizado con interceptor para JWT
 * Maneja:
 * - Adjunción automática del token
 * - Errores 401 (token expirado)
 * - Redirección al login cuando sea necesario
 */

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

// Event listeners para cambios de autenticación
const authListeners: Set<(authenticated: boolean) => void> = new Set();

export function onAuthStatusChange(callback: (authenticated: boolean) => void) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

function notifyAuthStatusChange(authenticated: boolean) {
  authListeners.forEach(cb => cb(authenticated));
}

/**
 * Cliente HTTP con soporte para JWT
 */
export async function apiClient(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Preparar headers
  const headers = new Headers(fetchOptions.headers);

  // Adjuntar token si existe y no está skippeado
  if (!skipAuth) {
    const token = sessionStorage.getItem('jwt');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Asegurar que tengamos Content-Type para requests que lo necesiten
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Manejar 401 Unauthorized (token expirado o inválido)
    if (response.status === 401) {
      console.warn('Token expirado o inválido. Cerrando sesión...');
      
      // Limpiar sesión
      sessionStorage.removeItem('jwt');
      sessionStorage.removeItem('userSession');
      sessionStorage.removeItem('user');
      
      // Notificar a los listeners
      notifyAuthStatusChange(false);
      
      // Redirigir al login
      window.location.href = '/';
    }

    return response;
  } catch (error) {
    console.error('Error en solicitud API:', error);
    throw error;
  }
}

/**
 * Método GET
 */
export function apiGet(url: string, skipAuth?: boolean) {
  return apiClient(url, { skipAuth });
}

/**
 * Método POST
 */
export function apiPost(url: string, data?: any, skipAuth?: boolean) {
  return apiClient(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    skipAuth,
  });
}

/**
 * Método PUT
 */
export function apiPut(url: string, data?: any, skipAuth?: boolean) {
  return apiClient(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    skipAuth,
  });
}

/**
 * Método DELETE
 */
export function apiDelete(url: string, skipAuth?: boolean) {
  return apiClient(url, {
    method: 'DELETE',
    skipAuth,
  });
}

/**
 * Verificar si la sesión es válida llamando la API
 */
export async function verifySession(): Promise<boolean> {
  try {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
      return false;
    }

    // Intentar hacer una petición que requiera autenticación
    const res = await apiClient('/api/auth/verify', {
      method: 'POST',
      skipAuth: false,
    });

    if (res.ok) {
      return true;
    }

    // Si recibimos 401 aquí, el apiClient ya limpió la sesión
    return false;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return false;
  }
}

/**
 * Verificar si el usuario está autenticado localmente
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('jwt') && !!sessionStorage.getItem('userSession');
}
