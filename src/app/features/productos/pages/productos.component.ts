import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core';
import { Producto } from '../../../core';
import { TableComponent, ModalComponent } from '../../../shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ModalComponent],
  template: `
    <div class="productos-container">
      <div class="productos-header">
        <h1>Gestión de Productos</h1>
        <p class="subtitle">Administra el inventario de productos</p>
      </div>

      <div class="productos-actions">
        <button class="btn-primary" (click)="openAddProductoModal()">
          <span>➕</span> Nuevo Producto
        </button>
        <button class="btn-secondary" (click)="generateExcel()">
          <span>📊</span> Generar Excel
        </button>
      </div>

      <!-- Tabla de Productos -->
      <div class="productos-table">
        <app-table
          [columns]="columns"
          [data]="(productos$ | async) ?? []"
          [actions]="tableActions"
        ></app-table>
      </div>

      <!-- Resumen -->
      <div class="productos-summary">
        <div class="summary-item">
          <span class="summary-label">Total Productos:</span>
          <span class="summary-value">{{ (productos$ | async)?.length || 0 }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Productos Activos:</span>
          <span class="summary-value">
            {{ calcularActivos() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Añadir/Editar Producto -->
    <app-modal
      [title]="modoEdicion ? 'Editar Producto' : 'Nuevo Producto'"
      [isOpen]="showProductoModal"
      (onClose)="closeProductoModal()"
      [content]="productoContent"
    ></app-modal>

    <ng-template #productoContent>
      <div class="modal-form">
        <div class="form-group">
          <label for="nombre">Nombre del Producto</label>
          <input
            type="text"
            id="nombre"
            [(ngModel)]="formularioProducto.nombre"
            placeholder="Ej: Helado de Vainilla"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="codigo">Código del Producto</label>
          <input
            type="text"
            id="codigo"
            [(ngModel)]="formularioProducto.codigo"
            placeholder="Ej: HV001"
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="precio">Precio</label>
          <div class="precio-input">
            <span class="currency">$</span>
            <input
              type="number"
              id="precio"
              [(ngModel)]="formularioProducto.precio"
              step="0.01"
              min="0"
              placeholder="0.00"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-group" *ngIf="modoEdicion">
          <label for="estado">Estado</label>
          <select
            id="estado"
            [(ngModel)]="formularioProducto.estado"
            class="form-control"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="modal-buttons">
          <button
            class="btn-save"
            (click)="guardarProducto()"
            [disabled]="!formularioProducto.nombre || !formularioProducto.codigo || !formularioProducto.precio || formularioProducto.precio <= 0"
          >
            💾 Guardar Producto
          </button>
          <button class="btn-cancel" (click)="closeProductoModal()">
            Cancelar
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .productos-container {
      padding: 2rem;
    }

    .productos-header {
      margin-bottom: 2rem;
    }

    .productos-header h1 {
      margin: 0;
      font-size: 2rem;
      color: #333;
      font-weight: 700;
    }

    .subtitle {
      margin: 0.5rem 0 0 0;
      color: #666;
    }

    .productos-actions {
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

    .productos-table {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .productos-summary {
      display: flex;
      gap: 2rem;
      justify-content: flex-end;
      flex-wrap: wrap;
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

    .form-control,
    select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .form-control:focus,
    select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    select {
      cursor: pointer;
    }

    .precio-input {
      display: flex;
      align-items: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .currency {
      padding: 0 0.75rem;
      background-color: #f5f5f5;
      font-weight: 600;
      color: #666;
    }

    .precio-input .form-control {
      border: none;
      flex: 1;
      border-radius: 0;
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
export class ProductosComponent implements OnInit {
  @ViewChild('productoContent') productoContent!: TemplateRef<any>;

  constructor(private productoService: ProductoService) {}

  get productos$(): Observable<Producto[]> {
    return this.productoService.productos$;
  }

  showProductoModal = false;
  modoEdicion = false;
  productoEnEdicion: Producto | null = null;

  columns = [
    { label: 'Nombre', key: 'nombre' },
    { label: 'Código', key: 'codigo' },
    { label: 'Precio', key: 'precio' },
    { label: 'Estado', key: 'estado' },
  ];

  tableActions = [
    { label: 'Editar', action: (item: Producto) => this.editarProducto(item), variant: 'primary' as const },
    { label: 'Eliminar', action: (item: Producto) => this.eliminarProducto(item), variant: 'danger' as const },
  ];

  formularioProducto: Partial<Producto> = {
    nombre: '',
    codigo: '',
    precio: 0,
    estado: 'activo',
  };

  ngOnInit(): void {}

  openAddProductoModal(): void {
    this.modoEdicion = false;
    this.productoEnEdicion = null;
    this.formularioProducto = {
      nombre: '',
      codigo: '',
      precio: 0,
      estado: 'activo',
    };
    this.showProductoModal = true;
  }

  openEditProductoModal(producto: Producto): void {
    this.modoEdicion = true;
    this.productoEnEdicion = producto;
    this.formularioProducto = { ...producto };
    this.showProductoModal = true;
  }

  closeProductoModal(): void {
    this.showProductoModal = false;
  }

  guardarProducto(): void {
    if (
      !this.formularioProducto.nombre ||
      !this.formularioProducto.codigo ||
      !this.formularioProducto.precio ||
      this.formularioProducto.precio <= 0
    ) {
      return;
    }

    if (this.modoEdicion && this.productoEnEdicion) {
      this.productoService
        .editarProducto(this.productoEnEdicion.id, this.formularioProducto)
        .subscribe({
          next: () => {
            this.closeProductoModal();
          },
          error: (error: any) => {
            alert('Error al actualizar el producto');
          },
        });
    } else {
      this.productoService
        .agregarProducto({
          nombre: this.formularioProducto.nombre!,
          codigo: this.formularioProducto.codigo!,
          precio: this.formularioProducto.precio!,
          estado: 'activo',
        })
        .subscribe({
          next: () => {
            this.closeProductoModal();
          },
          error: (error: any) => {
            alert('Error al crear el producto');
          },
        });
    }
  }

  editarProducto(producto: Producto): void {
    this.openEditProductoModal(producto);
  }

  eliminarProducto(producto: Producto): void {
    if (
      !confirm(
        `¿Deseas eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {},
      error: (error: any) => {
        alert('Error al eliminar el producto');
      },
    });
  }

  calcularActivos(): number {
    return this.productoService
      .obtenerProductos()
      .filter((p: any) => p.estado === 'activo').length;
  }

  generateExcel(): void {
    alert('Función de generación de Excel en desarrollo');
  }
}
