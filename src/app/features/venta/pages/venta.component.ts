import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService, TurnoService, ProductoService } from '../../../core';
import { Venta, Producto } from '../../../core';
import { TableComponent, ModalComponent } from '../../../shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-venta',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="venta-container">
      <div class="venta-header">
        <h1>Gestión de Ventas</h1>
        <p class="subtitle">Turno {{ (turnoService.turno$ | async)?.estado }}</p>
      </div>

      <div class="venta-actions">
        <button class="btn-primary" (click)="openAddVentaModal()">
          <span>➕</span> Añadir Venta
        </button>
        <button class="btn-secondary" (click)="generateExcel()">
          <span>📊</span> Generar Excel
        </button>
      </div>

      <!-- Tabla de Ventas -->
      <div class="venta-table">
        <app-table
          [columns]="columns"
          [data]="(ventas$ | async) ?? []"
          [actions]="tableActions"
        ></app-table>
      </div>

      <!-- Resumen -->
      <div class="venta-summary" *ngIf="(ventas$ | async)?.length ?? 0 > 0">
        <div class="summary-item">
          <span class="summary-label">Total Ventas:</span>
          <span class="summary-value">{{ (ventas$ | async)?.length || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Monto Total:</span>
          <span class="summary-value">{{ curencyFormat(calcularTotal()) }}</span>
        </div>
      </div>
    </div>

    <!-- Modal Añadir Venta -->
    <app-modal
      title="Añadir Nueva Venta"
      [isOpen]="showAddVentaModal"
      (onClose)="closeAddVentaModal()"
      [content]="addVentaContent"
    ></app-modal>

    <ng-template #addVentaContent>
      <div class="modal-form">
        <div class="form-group">
          <label for="productoBusqueda">Buscar Producto</label>
          <div class="search-container">
            <input
              type="text"
              id="productoBusqueda"
              [(ngModel)]="productoBusqueda"
              placeholder="Nombre o código del producto"
              class="form-control"
              (input)="buscarProductos()"
            />
            <button class="btn-search" (click)="buscarProductos()">🔍</button>
          </div>
        </div>

        <!-- Lista de Productos Sugeridos -->
        <div class="productos-sugeridos" *ngIf="productosFiltrados.length > 0">
          <p class="sugerencias-label">Productos encontrados:</p>
          <div
            *ngFor="let producto of productosFiltrados"
            class="producto-item"
            (click)="seleccionarProducto(producto)"
          >
            <div class="producto-info">
              <p class="producto-nombre">{{ producto.nombre }}</p>
              <p class="producto-codigo">Código: {{ producto.codigo }}</p>
            </div>
            <div class="producto-precio">{{ curencyFormat(producto.precio) }}</div>
          </div>
        </div>

        <!-- Producto Seleccionado -->
        <div *ngIf="productoSeleccionado" class="producto-seleccionado">
          <h4>Producto Seleccionado</h4>
          <p><strong>{{ productoSeleccionado.nombre }}</strong></p>
          <p class="codigo-small">Código: {{ productoSeleccionado.codigo }}</p>
          <p class="precio-small">Precio: {{ curencyFormat(productoSeleccionado.precio) }}</p>
        </div>

        <!-- Cantidad -->
        <div class="form-group" *ngIf="productoSeleccionado">
          <label for="cantidad">Cantidad</label>
          <input
            type="number"
            id="cantidad"
            [(ngModel)]="cantidad"
            min="1"
            class="form-control"
          />
        </div>

        <!-- Total -->
        <div *ngIf="productoSeleccionado" class="total-info">
          <span>Total:</span>
          <span class="total-amount">{{ curencyFormat(productoSeleccionado.precio * cantidad) }}</span>
        </div>

        <!-- Botones -->
        <div class="modal-buttons">
          <button
            class="btn-save"
            (click)="guardarVenta()"
            [disabled]="!productoSeleccionado || cantidad <= 0"
          >
            💾 Guardar Venta
          </button>
          <button class="btn-cancel" (click)="closeAddVentaModal()">
            Cancelar
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Modal Editar Venta -->
    <app-modal
      title="Editar Venta"
      [isOpen]="showEditVentaModal"
      (onClose)="closeEditVentaModal()"
      [content]="editVentaContent"
    ></app-modal>

    <ng-template #editVentaContent>
      <div class="modal-form" *ngIf="ventaEnEdicion">
        <div class="form-group">
          <label for="editProducto">Producto</label>
          <input
            type="text"
            id="editProducto"
            [value]="ventaEnEdicion.productoNombre"
            class="form-control"
            disabled
          />
        </div>

        <div class="form-group">
          <label for="editCantidad">Cantidad</label>
          <input
            type="number"
            id="editCantidad"
            [(ngModel)]="ventaEnEdicion.cantidad"
            min="1"
            class="form-control"
          />
        </div>

        <div class="total-info">
          <span>Total:</span>
          <span class="total-amount">
            {{ curencyFormat(ventaEnEdicion.precioUnitario * ventaEnEdicion.cantidad) }}
          </span>
        </div>

        <div class="modal-buttons">
          <button class="btn-save" (click)="actualizarVenta()">
            💾 Guardar Cambios
          </button>
          <button class="btn-cancel" (click)="closeEditVentaModal()">
            Cancelar
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .venta-container {
      padding: 2rem;
    }

    .venta-header {
      margin-bottom: 2rem;
    }

    .venta-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
      font-weight: 700;
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      color: #666;
      text-transform: capitalize;
    }

    .venta-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    }

    .venta-table {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .venta-summary {
      display: flex;
      gap: 2rem;
      justify-content: flex-end;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
    }

    .summary-label {
      font-size: 0.95rem;
      opacity: 0.9;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-container {
      display: flex;
      gap: 0.5rem;
    }

    .search-container .form-control {
      flex: 1;
    }

    .btn-search {
      padding: 0.75rem 1rem;
      background-color: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-search:hover {
      background-color: #5568d3;
    }

    .productos-sugeridos {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 1rem;
      max-height: 250px;
      overflow-y: auto;
      background-color: #f9f9f9;
    }

    .sugerencias-label {
      margin: 0 0 0.75rem 0;
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .producto-item {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
    }

    .producto-item:hover {
      background-color: #e7f0ff;
      border-color: #667eea;
    }

    .producto-info {
      flex: 1;
    }

    .producto-nombre {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .producto-codigo {
      margin: 0.2rem 0 0 0;
      font-size: 0.85rem;
      color: #999;
    }

    .producto-precio {
      font-weight: 700;
      color: #667eea;
      font-size: 1.1rem;
    }

    .producto-seleccionado {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      padding: 1rem;
      border-radius: 6px;
      border-left: 4px solid #28a745;
    }

    .producto-seleccionado h4 {
      margin: 0 0 0.5rem 0;
      color: #155724;
      font-size: 0.9rem;
      text-transform: uppercase;
    }

    .producto-seleccionado p {
      margin: 0.3rem 0;
      color: #155724;
    }

    .codigo-small,
    .precio-small {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .total-info {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      border: 2px solid #e0e0e0;
    }

    .total-amount {
      font-size: 1.5rem;
      color: #667eea;
    }

    .modal-buttons {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .btn-save,
    .btn-cancel {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-size: 0.95rem;
      letter-spacing: 0.5px;
    }

    .btn-save {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #5a6268;
    }
  `],
})
export class VentaComponent implements OnInit {
  @ViewChild('addVentaContent') addVentaContent!: TemplateRef<any>;
  @ViewChild('editVentaContent') editVentaContent!: TemplateRef<any>;

  get ventas$(): Observable<Venta[]> {
    return this.ventaService.ventas$;
  }

  showAddVentaModal = false;
  showEditVentaModal = false;

  columns = [
    { key: 'productoNombre', label: 'Producto' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'precioUnitario', label: 'Precio Unitario' },
    { key: 'total', label: 'Total' },
    { key: 'fecha', label: 'Fecha' },
  ];

  tableActions = [
    {
      label: '✏️ Editar',
      variant: 'primary' as const,
      action: (row: Venta) => this.editarVenta(row),
    },
    {
      label: '🗑️ Eliminar',
      variant: 'danger' as const,
      action: (row: Venta) => this.eliminarVenta(row),
    },
  ];

  productoBusqueda: string = '';
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  cantidad: number = 1;
  ventaEnEdicion: Venta | null = null;

  constructor(
    private ventaService: VentaService,
    public turnoService: TurnoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {}

  curencyFormat(value: number): string {
    return '$' + (value || 0).toFixed(2);
  }

  openAddVentaModal(): void {
    this.productoBusqueda = '';
    this.productosFiltrados = [];
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.showAddVentaModal = true;
  }

  closeAddVentaModal(): void {
    this.showAddVentaModal = false;
  }

  openEditVentaModal(venta: Venta): void {
    this.ventaEnEdicion = { ...venta };
    this.showEditVentaModal = true;
  }

  closeEditVentaModal(): void {
    this.showEditVentaModal = false;
    this.ventaEnEdicion = null;
  }

  buscarProductos(): void {
    if (!this.productoBusqueda.trim()) {
      this.productosFiltrados = [];
      return;
    }
    this.productosFiltrados = this.productoService.buscarProducto(
      this.productoBusqueda
    );
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.productoBusqueda = producto.nombre;
    this.productosFiltrados = [];
    this.cantidad = 1;
  }

  guardarVenta(): void {
    if (!this.productoSeleccionado) {
      return;
    }

    const turno = this.turnoService.getTurnoActual();
    if (!turno) {
      alert('No hay turno abierto');
      return;
    }

    const venta: Venta = {
      id: '',
      turnoId: turno.id,
      productoId: this.productoSeleccionado.id,
      productoNombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precioUnitario: this.productoSeleccionado.precio,
      total: this.cantidad * this.productoSeleccionado.precio,
      fecha: new Date(),
    };

    this.ventaService.agregarVenta(venta).subscribe({
      next: () => {
        this.closeAddVentaModal();
      },
      error: (error: any) => {
        alert('Error al guardar la venta');
      },
    });
  }

  editarVenta(venta: Venta): void {
    this.openEditVentaModal(venta);
  }

  actualizarVenta(): void {
    if (!this.ventaEnEdicion) {
      return;
    }

    this.ventaService
      .editarVenta(this.ventaEnEdicion.id, this.ventaEnEdicion)
      .subscribe({
        next: () => {
          this.closeEditVentaModal();
        },
        error: (error: any) => {
          alert('Error al actualizar la venta');
        },
      });
  }

  eliminarVenta(venta: Venta): void {
    if (!confirm(`¿Deseas eliminar la venta de ${venta.productoNombre}?`)) {
      return;
    }

    this.ventaService.eliminarVenta(venta.id).subscribe({
      next: () => {},
      error: (error: any) => {
        alert('Error al eliminar la venta');
      },
    });
  }

  calcularTotal(): number {
    return this.ventaService.obtenerVentas().reduce((sum: number, v: any) => sum + v.total, 0);
  }

  generateExcel(): void {
    alert('Función de generación de Excel en desarrollo');
  }
}
