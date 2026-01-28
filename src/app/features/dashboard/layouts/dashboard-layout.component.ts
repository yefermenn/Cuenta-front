import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2 class="logo">🍦</h2>
          <span class="brand-name">Control Heladería</span>
        </div>

        <nav class="sidebar-nav">
          <a
            routerLink="/dashboard/turno"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="icon">⏰</span>
            <span class="label">Turno</span>
          </a>
          <a
            routerLink="/dashboard/venta"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="icon">💰</span>
            <span class="label">Venta</span>
          </a>
          <a
            routerLink="/dashboard/productos"
            routerLinkActive="active"
            class="nav-item"
          >
            <span class="icon">📦</span>
            <span class="label">Productos</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="usuario$ | async as usuario">
            <div class="user-avatar">{{ usuario.nombre.charAt(0) }}</div>
            <div class="user-details">
              <p class="user-name">{{ usuario.nombre }}</p>
              <p class="user-email">{{ usuario.email }}</p>
            </div>
          </div>
          <button class="logout-btn" (click)="onLogout()">Cerrar Sesión</button>
        </div>
      </aside>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .logo {
      font-size: 2.5rem;
      margin: 0;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .sidebar-nav {
      flex: 1;
      padding: 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
      border-left: 4px solid white;
      padding-left: calc(1.5rem - 4px);
    }

    .icon {
      font-size: 1.5rem;
    }

    .label {
      font-weight: 600;
      font-size: 1rem;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      margin: 0;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .user-email {
      margin: 0.2rem 0 0 0;
      font-size: 0.8rem;
      opacity: 0.8;
      word-break: break-word;
    }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }

    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `],
})
export class DashboardLayoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  get usuario$(): Observable<any> {
    return this.authService.usuario$;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
