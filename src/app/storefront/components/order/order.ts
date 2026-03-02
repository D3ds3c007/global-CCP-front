import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Item, OrderFromServer, OrderService } from '../../services/order.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { APP_CURRENCY } from '../../../core/constants/app-locale';

type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'COD' | 'MOBILE_MONEY';
  items: OrderItem[];
};

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.html',
  styleUrls: ['./order.css'],
})
export class OrderComponent implements OnInit, OnDestroy {
  currencyCode = APP_CURRENCY;
  expandedId: string | null = null;
  readonly pictureUrl = environment.pictureUrl;

  orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-20260219-0001',
      createdAt: '2026-02-19T10:25:00.000Z',
      status: 'PAID',
      customerName: 'Jean Dupont',
      phone: '06 12 34 56 78',
      address: '12 rue Exemple, Paris',
      paymentMethod: 'COD',
      items: [
        {
          id: '1-1',
          productId: 'p-1001',
          name: 'Smart LED Desk Lamp',
          imageUrl: 'https://picsum.photos/id/1062/120/90',
          unitPrice: 48,
          quantity: 2,
        },
        {
          id: '1-2',
          productId: 'p-1004',
          name: 'Stainless Cookware Set',
          imageUrl: 'https://picsum.photos/id/1059/120/90',
          unitPrice: 129.9,
          quantity: 1,
        },
      ],
      total: 48 * 2 + 129.9,
    },
    {
      id: '2',
      orderNumber: 'ORD-20260218-0003',
      createdAt: '2026-02-18T15:10:00.000Z',
      status: 'PAID',
      customerName: 'Awa Traore',
      phone: '+225 07 00 00 00',
      address: 'Abidjan, Cocody',
      paymentMethod: 'MOBILE_MONEY',
      items: [
        {
          id: '2-1',
          productId: 'p-1003',
          name: 'Premium Yoga Mat',
          imageUrl: 'https://picsum.photos/id/1057/120/90',
          unitPrice: 35,
          quantity: 1,
        },
        {
          id: '2-2',
          productId: 'p-1016',
          name: 'Performance Protein Shaker',
          imageUrl: 'https://picsum.photos/id/1074/120/90',
          unitPrice: 24,
          quantity: 1,
        },
      ],
      total: 35 + 24,
    },
  ];

  trackById = (_: number, o: OrderFromServer) => o._id;
  trackByItemId = (_: number, it: Item) => it._id;

  private readonly orderService = inject(OrderService);
  readonly orders$: Observable<OrderFromServer[]> = this.orderService.loadOrders();
  private readonly destroy$ = new Subject<void>();

  orderFromServer: OrderFromServer[] = [];

  ngOnInit(): void {
    console.log('HistoryPage initialized');
    this.orders$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (orders) => {
        this.orderFromServer = orders;
        console.log('orderFromServer set to:', this.orderFromServer);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDetails(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  badgeClass(status: OrderStatus) {
    return {
      PAID: 'badge paid',
      PENDING: 'badge PENDING',
      CANCELLED: 'badge cancelled',
    }[status];
  }

  itemLineTotal(it: Item): number {
    return it.priceSnapshot * it.qty;
  }

  orderSubtotal(o: OrderFromServer): number {
    return o.items.reduce((sum, it) => sum + this.itemLineTotal(it), 0);
  }
}
