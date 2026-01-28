import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, TurnoService } from '../../../core';
import { Turno, Usuario } from '../../../core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-turno',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="turno-container">
      <div class="turno-card">
        <div class="card-header">
          <h1>Gestión de Turno</h1>
        </div>

        <div class="card-content">
          <!-- Usuario -->
          <div class="user-section" *ngIf="usuario$ | async as usuario">
            <div class="user-info-box">
              <p class="info-label">Usuario Autenticado</p>
              <p class="info-value">{{ usuario.nombre }}</p>
              <p class="info-email">{{ usuario.email }}</p>
            </div>
          </div>

          <!-- Estado del Turno -->
          <div class="turno-status-section">
            <div class="status-box" [class.open]="(turno$ | async)?.estado === 'abierto'">
              <p class="status-label">Estado del Turno</p>
              <div class="status-badge" [class]="'badge-' + ((turno$ | async)?.estado || 'cerrado')">
                {{ (turno$ | async)?.estado === 'abierto' ? '🟢 Turno Abierto' : '🔴 Turno Cerrado' }}
              </div>
              <p class="status-time" *ngIf="turno$ | async as turno">
                <span *ngIf="turno.estado === 'abierto'">
                  Abierto desde: {{ turno.fechaApertura | date: 'HH:mm:ss' }}
                </span>
                <span *ngIf="turno.estado === 'cerrado'">
                  Turno inactivo
                </span>
              </p>
            </div>
          </div>

          <!-- Botón de Acción -->
          <div class="action-section">
            <div *ngIf="!(turno$ | async)" class="loading">
              Cargando estado del turno...
            </div>
            <button
              *ngIf="(turno$ | async)?.estado === 'cerrado' || !(turno$ | async)"
              class="btn-main btn-open"
              (click)="abrirTurno()"
              [disabled]="isLoading"
            >
              <span class="btn-icon">🔓</span>
              Abrir Turno
            </button>
            <button
              *ngIf="(turno$ | async)?.estado === 'abierto'"
              class="btn-main btn-close"
              (click)="cerrarTurno()"
              [disabled]="isLoading"
            >
              <span class="btn-icon">🔒</span>
              Cerrar Turno
            </button>
          </div>

          <!-- Mensaje de Confirmación -->
          <div *ngIf="successMessage" class="success-message">
            ✓ {{ successMessage }}
          </div>
          <div *ngIf="errorMessage" class="error-message">
            ✗ {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .turno-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .turno-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    .card-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .card-content {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .user-section {
      background-color: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .user-info-box {
      margin: 0;
    }

    .info-label {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .info-value {
      margin: 0.5rem 0 0 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #333;
    }

    .info-email {
      margin: 0.3rem 0 0 0;
      font-size: 0.9rem;
      color: #666;
    }

    .turno-status-section {
      display: flex;
      justify-content: center;
    }

    .status-box {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      flex: 1;
      transition: all 0.3s ease;
    }

    .status-box.open {
      background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
    }

    .status-label {
      margin: 0;
      font-size: 0.85rem;
      color: #555;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .status-badge {
      margin: 1rem 0;
      font-size: 1.3rem;
      font-weight: 700;
      padding: 1rem;
      border-radius: 8px;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .badge-abierto {
      background-color: #28a745;
    }

    .badge-cerrado {
      background-color: #dc3545;
    }

    .status-time {
      margin: 1rem 0 0 0;
      font-size: 0.9rem;
      color: #555;
      opacity: 0.8;
    }

    .action-section {
      display: flex;
      gap: 1rem;
      justify-content: center;
      min-height: 60px;
      align-items: center;
    }

    .loading {
      color: #666;
      text-align: center;
      font-weight: 500;
    }

    .btn-main {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 250px;
      justify-content: center;
    }

    .btn-icon {
      font-size: 1.5rem;
    }

    .btn-open {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .btn-open:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
    }

    .btn-close {
      background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      color: white;
    }

    .btn-close:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(220, 53, 69, 0.4);
    }

    .btn-main:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      font-weight: 500;
      animation: slideDown 0.3s ease;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 8px;
      border-left: 4px solid #dc3545;
      font-weight: 500;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `],
})
export class TurnoComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private turnoService: TurnoService
  ) {}

  get usuario$(): Observable<Usuario | null> {
    return this.authService.usuario$;
  }

  get turno$(): Observable<Turno | null> {
    return this.turnoService.turno$;
  }

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit(): void {}

  abrirTurno(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.turnoService.abrirTurno(usuario.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Turno abierto exitosamente';
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Error al abrir el turno';
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  cerrarTurno(): void {
    if (!confirm('¿Deseas cerrar el turno?')) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.turnoService.cerrarTurno().subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Turno cerrado exitosamente';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cerrar el turno';
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }
}
