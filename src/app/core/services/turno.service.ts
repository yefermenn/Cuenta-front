import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Turno } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private turnoSubject = new BehaviorSubject<Turno | null>(null);
  public turno$ = this.turnoSubject.asObservable();

  constructor() {
    this.loadTurnoActual();
  }

  private loadTurnoActual(): void {
    // Simular carga del turno actual
    const turnoStored = localStorage.getItem('turno_actual');
    if (turnoStored) {
      this.turnoSubject.next(JSON.parse(turnoStored));
    }
  }

  abrirTurno(usuarioId: string): Observable<Turno> {
    return new Observable((observer) => {
      setTimeout(() => {
        const turno: Turno = {
          id: 'turno_' + Date.now(),
          usuarioId,
          estado: 'abierto',
          fechaApertura: new Date(),
        };

        localStorage.setItem('turno_actual', JSON.stringify(turno));
        this.turnoSubject.next(turno);

        observer.next(turno);
        observer.complete();
      }, 500);
    });
  }

  cerrarTurno(): Observable<Turno> {
    const turnoActual = this.turnoSubject.value;
    if (!turnoActual) {
      throw new Error('No hay turno abierto');
    }

    return new Observable((observer) => {
      setTimeout(() => {
        const turnoActualizado: Turno = {
          ...turnoActual,
          estado: 'cerrado',
          fechaCierre: new Date(),
        };

        localStorage.removeItem('turno_actual');
        this.turnoSubject.next(turnoActualizado);

        observer.next(turnoActualizado);
        observer.complete();
      }, 500);
    });
  }

  getTurnoActual(): Turno | null {
    return this.turnoSubject.value;
  }

  isTurnoAbierto(): boolean {
    return this.turnoSubject.value?.estado === 'abierto';
  }
}
