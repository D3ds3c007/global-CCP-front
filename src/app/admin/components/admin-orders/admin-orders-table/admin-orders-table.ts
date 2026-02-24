import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminOrder } from '../../../services/admin-orders-back';

@Component({
  selector: 'app-admin-orders-table',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './admin-orders-table.html',
  styleUrls: ['./admin-orders-table.css'],
})
export class AdminOrdersTableComponent {
  @Input() orders: AdminOrder[] = [];
  @Input() selectedId: string | null = null;

  @Output() selectOrder = new EventEmitter<string>();
}