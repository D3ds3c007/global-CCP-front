import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Order } from '../../../services/order';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './orders-table.html',
  styleUrls: ['./orders-table.css'],
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
  @Input() selectedId: string | null = null;

  @Output() selectOrder = new EventEmitter<string>();

  trackByOrderId = (_index: number, order: Order): string => order.id;
}