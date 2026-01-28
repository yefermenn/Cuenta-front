import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'danger' | 'secondary';
  action: (row: any) => void;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th *ngFor="let column of columns">{{ column.label }}</th>
            <th *ngIf="actions.length > 0">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="data.length === 0">
            <td [colSpan]="columns.length + (actions.length > 0 ? 1 : 0)" class="text-center">
              No hay datos disponibles
            </td>
          </tr>
          <tr *ngFor="let row of data">
            <td *ngFor="let column of columns">
              {{ getNestedValue(row, column.key) }}
            </td>
            <td *ngIf="actions.length > 0" class="actions-cell">
              <button
                *ngFor="let action of actions"
                class="action-btn"
                [class]="'action-' + (action.variant || 'secondary')"
                (click)="action.action(row)"
                title="{{ action.label }}"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }

    thead {
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      text-transform: uppercase;
      font-size: 0.875rem;
    }

    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
      color: #555;
    }

    tbody tr:hover {
      background-color: #f8f9fa;
    }

    .actions-cell {
      text-align: center;
    }

    .action-btn {
      padding: 0.4rem 0.8rem;
      margin: 0 0.2rem;
      border: none;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .action-primary {
      background-color: #007bff;
      color: white;
    }

    .action-primary:hover {
      background-color: #0056b3;
    }

    .action-danger {
      background-color: #dc3545;
      color: white;
    }

    .action-danger:hover {
      background-color: #c82333;
    }

    .action-secondary {
      background-color: #6c757d;
      color: white;
    }

    .action-secondary:hover {
      background-color: #5a6268;
    }

    .text-center {
      text-align: center;
      padding: 2rem !important;
      color: #999;
    }
  `],
})
export class TableComponent implements OnInit {
  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];

  ngOnInit(): void {
    if (this.columns.length === 0 && this.data.length > 0) {
      // Auto-detectar columnas
      const firstRow = this.data[0];
      this.columns = Object.keys(firstRow).map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }));
    }
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
