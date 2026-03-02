import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserRow } from '../../../services/admin-customers-back';

@Component({
  selector: 'app-admin-customers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-customers-list.html',
  styleUrls: ['./admin-customers-list.css'],
})
export class AdminCustomersListComponent {
  @Input() customers: UserRow[] = [];
  @Input() selectedId: string | null = null;

  @Output() select = new EventEmitter<string>();

  get selectedCustomer(): UserRow | null {
    return this.customers.find((customer) => customer.id === this.selectedId) ?? this.customers[0] ?? null;
  }

  isActiveRow(id: string): boolean {
    return this.selectedId === id || (!this.selectedId && this.customers[0]?.id === id);
  }

  trackById(_index: number, customer: UserRow): string {
    return customer.id;
  }

  initials(customer: UserRow): string {
    return customer.fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  statusLabel(customer: UserRow): string {
    if (customer.status === 'banned') {
      return 'Restricted';
    }

    return customer.status === 'active' ? 'Active' : 'Pending';
  }

  roleLabel(customer: UserRow): string {
    return customer.role === 'SHOP' ? 'Shop owner' : 'Customer';
  }

  formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value || 'Unknown date';
    }

    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

export { AdminCustomersListComponent as AdminCustomersList };
