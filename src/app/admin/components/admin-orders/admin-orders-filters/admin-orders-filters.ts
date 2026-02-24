import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminOrdersQuery, OrderStatus } from '../../../services/admin-orders-back';

@Component({
  selector: 'app-admin-orders-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders-filters.html',
  styleUrls: ['./admin-orders-filters.css'],
})
export class AdminOrdersFiltersComponent {
  @Input({ required: true }) query!: AdminOrdersQuery;
  @Input() shops: { id: string; name: string }[] = [];

  @Output() queryChange = new EventEmitter<Partial<AdminOrdersQuery>>();

  statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
}