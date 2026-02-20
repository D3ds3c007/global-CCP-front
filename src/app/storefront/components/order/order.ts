import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type OrderItem = {
  id: string;           // id de la ligne (ou productId si tu veux)
  productId: string;
  name: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string
  total: number;
  status: OrderStatus;

  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'COD' | 'MOBILE_MONEY';

  items: OrderItem[];  // <-- AJOUT : les articles de la commande
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
      customerName: 'Awa Traoré',
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

  trackById = (_: number, o: Order) => o.id;
  trackByItemId = (_: number, it: OrderItem) => it.id;

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

  itemLineTotal(it: OrderItem): number {
    return it.unitPrice * it.quantity;
  }

  orderSubtotal(o: Order): number {
    return o.items.reduce((sum, it) => sum + this.itemLineTotal(it), 0);
  }
}