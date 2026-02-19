import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type OrderStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  status: OrderStatus;

  customer: {
    fullName: string;
    phone: string;
    address: string;
    note?: string;
  };

  payment: {
    method: 'COD' | 'MOBILE_MONEY';
    provider?: string;
    mmNumber?: string;
  };

  delivery: {
    id: string;
    label: string;
    fee: number;
  };

  items: OrderItem[];
  subtotal: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly storageKey = 'storefront.orders.v1';
  private readonly subject = new BehaviorSubject<Order[]>(this.load());
  readonly orders$ = this.subject.asObservable();

  get snapshot(): Order[] {
    return this.subject.value;
  }

  add(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) {
    const now = new Date();
    const next: Order = {
      ...order,
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      createdAt: now.toISOString(),
      orderNumber: this.generateOrderNumber(now),
    };

    const updated = [next, ...this.snapshot];
    this.subject.next(updated);
    this.save(updated);
  }

  private generateOrderNumber(now: Date): string {
    // ex: ORD-20260219-0007
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const datePart = `${y}${m}${d}`;

    const today = this.snapshot.filter(o => o.orderNumber.startsWith(`ORD-${datePart}-`));
    const seq = String(today.length + 1).padStart(4, '0');
    return `ORD-${datePart}-${seq}`;
  }

  private load(): Order[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  }

  private save(orders: Order[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }
}
