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

  isActiveRow(id: string) {
    return this.selectedId === id;
  }

  trackById(_index: number, customer: UserRow): string {
    return customer.id;
  }
}

export { AdminCustomersListComponent as AdminCustomersList };
