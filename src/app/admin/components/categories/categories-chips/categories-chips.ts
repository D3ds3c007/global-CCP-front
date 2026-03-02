import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category } from '../../../services/admin-categories-back';

@Component({
  selector: 'app-categories-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-chips.html',
  styleUrls: ['./categories-chips.css'],
})
export class CategoriesChipsComponent {
  @Input() categories: Category[] = [];

  @Output() edit = new EventEmitter<Category>();
  @Output() toggle = new EventEmitter<string>();

  trackByCategory = (_index: number, category: Category) => category._id ?? category.id;

  statusLabel(category: Category): string {
    return category.status === 'active' ? 'Live' : 'Paused';
  }

  toggleLabel(category: Category): string {
    return category.status === 'active' ? 'Disable' : 'Enable';
  }

  typeLabel(category: Category): string {
    return String(category.type ?? 'General');
  }
}
