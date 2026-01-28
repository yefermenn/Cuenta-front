import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="'btn btn-' + variant"
      [disabled]="disabled"
      (click)="onClick()"
    >
      {{ label }}
    </button>
  `,
  styles: [`
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 86, 179, 0.3);
    }

    .btn-success {
      background-color: #28a745;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #218838;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(33, 136, 56, 0.3);
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(200, 35, 51, 0.3);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(90, 98, 104, 0.3);
    }
  `],
})
export class ButtonComponent {
  @Input() label: string = 'Click me';
  @Input() variant: 'primary' | 'success' | 'danger' | 'secondary' = 'primary';
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
