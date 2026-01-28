import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Venta } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private ventasSubject = new BehaviorSubject<Venta[]>([]);
  public ventas$ = this.ventasSubject.asObservable();

  constructor() {
    this.loadVentas();
  }

  private loadVentas(): void {
    const ventasStored = localStorage.getItem('ventas');
    if (ventasStored) {
      this.ventasSubject.next(JSON.parse(ventasStored));
    } else {
      this.ventasSubject.next([]);
    }
  }

  agregarVenta(venta: Venta): Observable<Venta> {
    return new Observable((observer) => {
      setTimeout(() => {
        const ventasActuales = this.ventasSubject.value;
        const nuevaVenta: Venta = {
          ...venta,
          id: 'venta_' + Date.now(),
          fecha: new Date(),
        };

        const ventasActualizadas = [...ventasActuales, nuevaVenta];
        localStorage.setItem('ventas', JSON.stringify(ventasActualizadas));
        this.ventasSubject.next(ventasActualizadas);

        observer.next(nuevaVenta);
        observer.complete();
      }, 300);
    });
  }

  editarVenta(id: string, venta: Partial<Venta>): Observable<Venta> {
    return new Observable((observer) => {
      setTimeout(() => {
        const ventasActuales = this.ventasSubject.value;
        const indice = ventasActuales.findIndex((v) => v.id === id);

        if (indice === -1) {
          observer.error('Venta no encontrada');
          return;
        }

        ventasActuales[indice] = { ...ventasActuales[indice], ...venta };
        localStorage.setItem('ventas', JSON.stringify(ventasActuales));
        this.ventasSubject.next([...ventasActuales]);

        observer.next(ventasActuales[indice]);
        observer.complete();
      }, 300);
    });
  }

  eliminarVenta(id: string): Observable<void> {
    return new Observable((observer) => {
      setTimeout(() => {
        const ventasActuales = this.ventasSubject.value;
        const ventasActualizadas = ventasActuales.filter((v) => v.id !== id);
        
        localStorage.setItem('ventas', JSON.stringify(ventasActualizadas));
        this.ventasSubject.next(ventasActualizadas);

        observer.next();
        observer.complete();
      }, 300);
    });
  }

  obtenerVentasPorTurno(turnoId: string): Observable<Venta[]> {
    return new Observable((observer) => {
      const ventas = this.ventasSubject.value.filter(
        (v) => v.turnoId === turnoId
      );
      observer.next(ventas);
      observer.complete();
    });
  }

  obtenerVentas(): Venta[] {
    return this.ventasSubject.value;
  }
}
