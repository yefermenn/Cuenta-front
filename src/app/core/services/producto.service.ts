import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor() {
    this.inicializarProductos();
  }

  private inicializarProductos(): void {
    const productosStored = localStorage.getItem('productos');
    if (productosStored) {
      this.productosSubject.next(JSON.parse(productosStored));
    } else {
      // Datos de ejemplo
      const productosDefault: Producto[] = [
        {
          id: '1',
          nombre: 'Helado Vainilla',
          codigo: 'HV001',
          precio: 5.99,
          estado: 'activo',
        },
        {
          id: '2',
          nombre: 'Helado Fresa',
          codigo: 'HF001',
          precio: 5.99,
          estado: 'activo',
        },
        {
          id: '3',
          nombre: 'Helado Chocolate',
          codigo: 'HC001',
          precio: 6.49,
          estado: 'activo',
        },
      ];
      localStorage.setItem('productos', JSON.stringify(productosDefault));
      this.productosSubject.next(productosDefault);
    }
  }

  obtenerProductos(): Producto[] {
    return this.productosSubject.value;
  }

  agregarProducto(producto: Omit<Producto, 'id'>): Observable<Producto> {
    return new Observable((observer) => {
      setTimeout(() => {
        const productosActuales = this.productosSubject.value;
        const nuevoProducto: Producto = {
          ...producto,
          id: 'prod_' + Date.now(),
        };

        const productosActualizados = [...productosActuales, nuevoProducto];
        localStorage.setItem('productos', JSON.stringify(productosActualizados));
        this.productosSubject.next(productosActualizados);

        observer.next(nuevoProducto);
        observer.complete();
      }, 300);
    });
  }

  editarProducto(
    id: string,
    producto: Partial<Producto>
  ): Observable<Producto> {
    return new Observable((observer) => {
      setTimeout(() => {
        const productosActuales = this.productosSubject.value;
        const indice = productosActuales.findIndex((p) => p.id === id);

        if (indice === -1) {
          observer.error('Producto no encontrado');
          return;
        }

        productosActuales[indice] = { ...productosActuales[indice], ...producto };
        localStorage.setItem('productos', JSON.stringify(productosActuales));
        this.productosSubject.next([...productosActuales]);

        observer.next(productosActuales[indice]);
        observer.complete();
      }, 300);
    });
  }

  eliminarProducto(id: string): Observable<void> {
    return new Observable((observer) => {
      setTimeout(() => {
        const productosActuales = this.productosSubject.value;
        const productosActualizados = productosActuales.filter((p) => p.id !== id);

        localStorage.setItem('productos', JSON.stringify(productosActualizados));
        this.productosSubject.next(productosActualizados);

        observer.next();
        observer.complete();
      }, 300);
    });
  }

  buscarProducto(query: string): Producto[] {
    return this.productosSubject.value.filter(
      (p) =>
        p.nombre.toLowerCase().includes(query.toLowerCase()) ||
        p.codigo.toLowerCase().includes(query.toLowerCase())
    );
  }
}
