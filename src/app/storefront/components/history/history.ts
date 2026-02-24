import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';
type PaymentMethod = 'COD' | 'MOBILE_MONEY';

type HistoryOrder = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  total: number;
  status: OrderStatus;

  customerName: string;
  phone: string;
  address: string;

  paymentMethod: PaymentMethod;
  note?: string;
};

type StatusFilter = 'ALL' | OrderStatus;

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './history.html',
  styleUrls: ['./history.css'],
})
export class HistoryComponent {
  currencyCode = 'EUR';

  // UI state
  expandedId: string | null = null;
  statusFilter: StatusFilter = 'ALL';
  search = '';

  // Mock: historique (tous les statuts)
  orders: HistoryOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-20260219-0001',
      createdAt: '2026-02-19T10:25:00.000Z',
      total: 129.9,
      status: 'PAID',
      customerName: 'Jean Dupont',
      phone: '06 12 34 56 78',
      address: '12 rue Exemple, Paris',
      paymentMethod: 'COD',
      note: 'Sonner à l’interphone',
    },
    {
      id: '2',
      orderNumber: 'ORD-20260219-0002',
      createdAt: '2026-02-19T12:10:00.000Z',
      total: 59,
      status: 'PENDING',
      customerName: 'Awa Traoré',
      phone: '+225 07 00 00 00',
      address: 'Abidjan, Cocody',
      paymentMethod: 'MOBILE_MONEY',
    },
    {
      id: '3',
      orderNumber: 'ORD-20260218-0003',
      createdAt: '2026-02-18T15:10:00.000Z',
      total: 22.5,
      status: 'CANCELLED',
      customerName: 'Mohamed Ali',
      phone: '+212 6 00 00 00 00',
      address: 'Casablanca',
      paymentMethod: 'COD',
    },
  ];

  trackById = (_: number, o: HistoryOrder) => o.id;

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

  filteredOrders(): HistoryOrder[] {
    const q = this.search.trim().toLowerCase();

    return this.orders
      .filter(o => (this.statusFilter === 'ALL' ? true : o.status === this.statusFilter))
      .filter(o => {
        if (!q) return true;
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // plus récent d'abord
  }

  clearFilters() {
    this.statusFilter = 'ALL';
    this.search = '';
  }
}