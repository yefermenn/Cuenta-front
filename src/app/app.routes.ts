import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login.component';
import { DashboardLayoutComponent } from './features/dashboard/layouts/dashboard-layout.component';
import { TurnoComponent } from './features/turno/pages/turno.component';
import { VentaComponent } from './features/venta/pages/venta.component';
import { ProductosComponent } from './features/productos/pages/productos.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'turno', pathMatch: 'full' },
      { path: 'turno', component: TurnoComponent },
      { path: 'venta', component: VentaComponent },
      { path: 'productos', component: ProductosComponent },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
