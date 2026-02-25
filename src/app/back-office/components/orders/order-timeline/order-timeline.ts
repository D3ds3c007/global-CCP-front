import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderStatus, OrderStatusEvent } from '../../../services/order';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './order-timeline.html',
  styleUrls: ['./order-timeline.css'],
})
export class OrderTimelineComponent {
  @Input() status!: OrderStatus;
  @Input() history: OrderStatusEvent[] = [];

  steps: OrderStatus[] = ['PENDING', 'confirmed', 'preparing', 'ready', 'delivered'];

  isDone(step: OrderStatus): boolean {
    if (this.status === 'cancelled') return false;
    return this.steps.indexOf(step) <= this.steps.indexOf(this.status);
  }
}