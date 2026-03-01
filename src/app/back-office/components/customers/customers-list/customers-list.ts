import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../../services/customers-back';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers-list.html',
  styleUrls: ['./customers-list.css'],
})
export class CustomersListComponent {
  @Input() customers: Customer[] = [];
  @Input() selectedId: string | null = null;

  @Output() select = new EventEmitter<string>();

  trackById(_index: number, customer: Customer): string {
    return customer.id;
  }
}

export { CustomersListComponent as CustomersList };
