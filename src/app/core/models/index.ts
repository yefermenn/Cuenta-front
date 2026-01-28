export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

export interface Turno {
  id: string;
  usuarioId: string;
  estado: 'abierto' | 'cerrado';
  fechaApertura: Date;
  fechaCierre?: Date;
}

export interface Venta {
  id: string;
  turnoId: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  estado: 'activo' | 'inactivo';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
