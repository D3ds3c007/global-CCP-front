import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersQuery, OrderStatus } from '../../../services/order';

@Component({
  selector: 'app-orders-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders-filters.html',
  styleUrls: ['./orders-filters.css'],
})
export class OrdersFiltersComponent {
  @Input({ required: true }) query!: OrdersQuery;
  @Output() queryChange = new EventEmitter<Partial<OrdersQuery>>();

  statuses: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
}