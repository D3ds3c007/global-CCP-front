import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface BuyerContact {
  fullName: string;
  email: string;
  phone: string;
}

export interface Address {
  line1: string;
  city: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  imageUrl?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string; // ISO
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string; // ISO
  status: OrderStatus;

  buyer: BuyerContact;
  address: Address;

  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;

  history: OrderStatusEvent[];
}

export interface OrdersQuery {
  search: string;
  status: OrderStatus | 'all';
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function nowIso() {
  return new Date().toISOString();
}


@Injectable({ providedIn: 'root' })
export class OrdersBackService {
  private readonly ordersSubject = new BehaviorSubject<Order[]>(this.seedOrders());
  private readonly querySubject = new BehaviorSubject<OrdersQuery>({ search: '', status: 'all' });
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly orders$ = this.ordersSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  readonly ordersFiltered$ = combineLatest([this.orders$, this.query$]).pipe(
    map(([orders, q]) => {
      const s = q.search.trim().toLowerCase();
      return orders.filter(o => {
        const matchSearch =
          !s ||
          o.id.toLowerCase().includes(s) ||
          o.buyer.fullName.toLowerCase().includes(s);

        const matchStatus = q.status === 'all' || o.status === q.status;
        return matchSearch && matchStatus;
      });
    })
  );

  readonly selectedOrder$ = combineLatest([this.orders$, this.selectedId$]).pipe(
    map(([orders, id]) => orders.find(o => o.id === id) ?? null)
  );

  readonly vm$ = combineLatest({
    query: this.query$,
    orders: this.ordersFiltered$,
    selectedOrder: this.selectedOrder$,
  });

  setQuery(patch: Partial<OrdersQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  select(orderId: string) {
    this.selectedIdSubject.next(orderId);
  }

  /** initialise sélection (appelé par la page si rien n’est sélectionné) */
  ensureSelectedFirst(filtered: Order[]) {
    if (!this.selectedIdSubject.value && filtered.length) {
      this.selectedIdSubject.next(filtered[0].id);
    }
  }

  canCancel(order: Order) {
    return order.status !== 'delivered' && order.status !== 'cancelled';
  }

  nextStatus(order: Order): OrderStatus | null {
    if (order.status === 'cancelled' || order.status === 'delivered') return null;
    const idx = STATUS_FLOW.indexOf(order.status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  }

  advance(orderId: string) {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const next = this.nextStatus(order);
    if (!next) return;

    this.updateStatus(orderId, next);
  }

  cancel(orderId: string, note = 'Cancelled by owner') {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    if (!order || !this.canCancel(order)) return;

    this.updateStatus(orderId, 'cancelled', note);
  }

  private updateStatus(orderId: string, status: OrderStatus, note?: string) {
    const nextOrders: Order[] = this.ordersSubject.value.map(o => {
      if (o.id !== orderId) return o;

      const event = { status, at: nowIso(), note };
      return {
        ...o,
        status,
        history: [...o.history, event],
      };
    });

    this.ordersSubject.next(nextOrders);
  }

  private seedOrders(): Order[] {
    const img = (seed: string) => `https://picsum.photos/seed/${seed}/120/90`;

    const mkTotals = (items: any[]) => {
      const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const shipping = subtotal > 200 ? 0 : 12;
      const total = subtotal + shipping;
      return { subtotal, shipping, total };
    };

    const o1Items = [
      { productId: 'p1', name: 'Keyboard', unitPrice: 49, qty: 2, imageUrl: img('keyboard') },
      { productId: 'p2', name: 'Mouse', unitPrice: 19, qty: 1, imageUrl: img('mouse') },
    ];
    const o2Items = [
      { productId: 'p3', name: 'Screen', unitPrice: 180, qty: 1, imageUrl: img('screen') },
    ];

    const o1Totals = mkTotals(o1Items);
    const o2Totals = mkTotals(o2Items);

    const base = (id: string, status: OrderStatus, items: any[], totals: any): Order => ({
      id,
      createdAt: nowIso(),
      status,
      buyer: { fullName: 'Amine Ben', email: 'amine@mail.com', phone: '+212 6 00 00 00 00' },
      address: { line1: '12 Rue Hassan II', city: 'Casablanca', zip: '20000', country: 'MA' },
      items,
      ...totals,
      history: [{ status, at: nowIso() }],
    });

    return [
      base('ORD-1001', 'pending', o1Items, o1Totals),
      base('ORD-1002', 'confirmed', o2Items, o2Totals),
      base('ORD-1003', 'preparing', o1Items, o1Totals),
    ];
  }
}