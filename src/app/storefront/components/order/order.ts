import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string
  total: number;
  status: OrderStatus;

  // infos utiles
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'COD' | 'MOBILE_MONEY';
};

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order.html',
  styleUrls: ['./order.css'],
})
export class OrderComponent {
  currencyCode = 'EUR';
  expandedId: string | null = null;

  // Exemple: mock orders payées
  orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-20260219-0001',
      createdAt: '2026-02-19T10:25:00.000Z',
      total: 129.90,
      status: 'PAID',
      customerName: 'Jean Dupont',
      phone: '06 12 34 56 78',
      address: '12 rue Exemple, Paris',
      paymentMethod: 'COD',
    },
    {
      id: '2',
      orderNumber: 'ORD-20260218-0003',
      createdAt: '2026-02-18T15:10:00.000Z',
      total: 59.00,
      status: 'PAID',
      customerName: 'Awa Traoré',
      phone: '+225 07 00 00 00',
      address: 'Abidjan, Cocody',
      paymentMethod: 'MOBILE_MONEY',
    },
  ];

  trackById = (_: number, o: Order) => o.id;

  toggleDetails(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  badgeClass(status: OrderStatus) {
    return {
      PAID: 'badge paid',
      PENDING: 'badge pending',
      CANCELLED: 'badge cancelled',
    }[status];
  }
}