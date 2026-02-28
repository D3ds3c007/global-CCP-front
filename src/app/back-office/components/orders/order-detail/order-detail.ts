import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Order } from '../../../services/order';
import { OrderTimelineComponent } from '../order-timeline/order-timeline';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, OrderTimelineComponent],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css'],
})
export class OrderDetailComponent {
  @Input() order: Order | null = null;

  @Input() nextStatus: string | null = null;
  @Input() canCancel = false;

  @Output() advance = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  readonly pictureBaseUrl = environment.pictureUrl;
}