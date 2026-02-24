import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Order } from '../../../services/dashboard-service';

@Component({
  selector: 'app-last-orders-table',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './last-orders-table.html',
  styleUrls: ['./last-orders-table.css'],
})
export class LastOrdersTableComponent {
  @Input() orders: Order[] = [];
}