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
  @Output() edit = new EventEmitter<Customer>();
  @Output() remove = new EventEmitter<Customer>();
  @Output() call = new EventEmitter<Customer>();
}