/**
 * Servicio de autenticación
 * Centraliza la lógica de login, logout y manejo de sesiones
 */

import { apiPost } from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  nombre?: string;
  name?: string;
  email: string;
  shift?: boolean;
  base?: number | null;
  products?: any[];
  [key: string]: any;
}

export interface LoginResponse {
  access_token?: string;
  token?: string;
  jwt?: string;
  accessToken?: string;
  detail?: User;
  user?: User;
  [key: string]: any;
}

/**
 * Realizar login
 */
export async function login(credentials: LoginCredentials): Promise<{
  success: boolean;
  error?: string;
  user?: User;
}> {
  try {
    const res = await apiPost('/api/auth/login', credentials, true); // skipAuth=true

    const data: LoginResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: (data && (data.message || data.error)) || 'Credenciales inválidas',
      };
    }

    // Extraer token (el backend puede devolver cualquiera de estos nombres)
    const token = data?.access_token ?? data?.token ?? data?.jwt ?? data?.accessToken;

    if (!token) {
      return {
        success: false,
        error: 'No se recibió token del servidor',
      };
    }

    // Extraer usuario
    const user = data?.detail ?? data?.user ?? null;

    if (!user) {
      return {
        success: false,
        error: 'No se recibió información del usuario',
      };
    }

    // Guardar en sessionStorage (se limpia al cerrar el navegador)
    sessionStorage.setItem('jwt', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('userSession', JSON.stringify(user));

    // Guardar datos adicionales en localStorage si es necesario
    try {
      sessionStorage.setItem('turnoAbierto', JSON.stringify(Boolean(user.shift)));
    } catch (e) {
      console.warn('Error guardando turnoAbierto:', e);
    }

    if (user.base !== undefined && user.base !== null) {
      sessionStorage.setItem('baseCaja', String(user.base));
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error durante login:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
}

/**
 * Hacer logout
 */
export function logout(): void {
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userSession');
  sessionStorage.removeItem('turnoAbierto');
  sessionStorage.removeItem('baseCaja');
}

/**
 * Obtener el usuario actual desde sesión
 */
export function getCurrentUser(): User | null {
  const userSession = sessionStorage.getItem('userSession');
  if (!userSession) {
    return null;
  }

  try {
    return JSON.parse(userSession);
  } catch (error) {
    console.error('Error parseando userSession:', error);
    return null;
  }
}

/**
 * Obtener el nombre del usuario actual
 */
export function getCurrentUserName(): string {
  const user = getCurrentUser();
  return user?.nombre ?? user?.name ?? user?.email ?? '';
}

/**
 * Obtener el token JWT actual
 */
export function getToken(): string | null {
  return sessionStorage.getItem('jwt');
}

/**
 * Verificar si hay una sesión válida
 */
export function hasValidSession(): boolean {
  return !!getToken() && !!getCurrentUser();
}
