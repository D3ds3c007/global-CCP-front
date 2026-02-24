import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

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
  at: string;
  note?: string;
}

export interface AdminOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;

  shopId: string;
  shopName: string;

  buyer: BuyerContact;
  address: Address;

  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;

  history: OrderStatusEvent[];
}

export interface AdminOrdersQuery {
  search: string;                 // id ou buyer ou shop
  status: OrderStatus | 'all';
  shopId: string | 'all';
}

export interface AdminOrdersVM {
  query: AdminOrdersQuery;
  shops: { id: string; name: string }[];
  orders: AdminOrder[];
  selectedId: string | null;
  selectedOrder: AdminOrder | null;
}

const FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
const nowIso = () => new Date().toISOString();

@Injectable({ providedIn: 'root' })
export class AdminOrdersBackService {
  private readonly ordersSubject = new BehaviorSubject<AdminOrder[]>(this.seedOrders());
  private readonly querySubject = new BehaviorSubject<AdminOrdersQuery>({
    search: '',
    status: 'all',
    shopId: 'all',
  });
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly orders$ = this.ordersSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  // liste shops pour filtre
  readonly shops$ = this.orders$.pipe(
    map(orders => {
      const mapShop = new Map<string, string>();
      orders.forEach(o => mapShop.set(o.shopId, o.shopName));
      return Array.from(mapShop.entries()).map(([id, name]) => ({ id, name }));
    })
  );

  readonly ordersFiltered$ = combineLatest([this.orders$, this.query$]).pipe(
    map(([orders, q]) => {
      const s = q.search.trim().toLowerCase();
      return orders.filter(o => {
        const matchSearch =
          !s ||
          o.id.toLowerCase().includes(s) ||
          o.buyer.fullName.toLowerCase().includes(s) ||
          o.shopName.toLowerCase().includes(s);

        const matchStatus = q.status === 'all' || o.status === q.status;
        const matchShop = q.shopId === 'all' || o.shopId === q.shopId;

        return matchSearch && matchStatus && matchShop;
      });
    })
  );

  readonly selectedOrder$ = combineLatest([this.orders$, this.selectedId$]).pipe(
    map(([orders, id]) => orders.find(o => o.id === id) ?? null)
  );

  readonly vm$: Observable<AdminOrdersVM> = combineLatest({
    query: this.query$,
    shops: this.shops$,
    orders: this.ordersFiltered$,
    selectedId: this.selectedId$,
    selectedOrder: this.selectedOrder$,
  });

  setQuery(patch: Partial<AdminOrdersQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  select(id: string) {
    this.selectedIdSubject.next(id);
  }

  ensureSelectedFirst(filtered: AdminOrder[]) {
    if (!this.selectedIdSubject.value && filtered.length) {
      this.selectedIdSubject.next(filtered[0].id);
    }
  }

  // --- status flow ---
  canCancel(o: AdminOrder) {
    return o.status !== 'delivered' && o.status !== 'cancelled';
  }

  nextStatus(o: AdminOrder): OrderStatus | null {
    if (o.status === 'cancelled' || o.status === 'delivered') return null;
    const idx = FLOW.indexOf(o.status);
    return idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;
  }

  advance(orderId: string) {
    const o = this.ordersSubject.value.find(x => x.id === orderId);
    if (!o) return;
    const next = this.nextStatus(o);
    if (!next) return;
    this.updateStatus(orderId, next);
  }

  cancel(orderId: string, note = 'Cancelled by admin') {
    const o = this.ordersSubject.value.find(x => x.id === orderId);
    if (!o || !this.canCancel(o)) return;
    this.updateStatus(orderId, 'cancelled', note);
  }

  private updateStatus(orderId: string, status: OrderStatus, note?: string) {
    const next: AdminOrder[] = this.ordersSubject.value.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        status,
        history: [...o.history, { status, at: nowIso(), note }],
      };
    });
    this.ordersSubject.next(next);
  }

  private seedOrders(): AdminOrder[] {
    const img = (seed: string) => `https://picsum.photos/seed/${seed}/120/90`;

    const mkTotals = (items: OrderItem[]) => {
      const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
      const shipping = subtotal > 200 ? 0 : 12;
      const total = subtotal + shipping;
      return { subtotal, shipping, total };
    };

    const items1: OrderItem[] = [
      { productId: 'p1', name: 'Keyboard', unitPrice: 49, qty: 2, imageUrl: img('keyboard') },
      { productId: 'p2', name: 'Mouse', unitPrice: 19, qty: 1, imageUrl: img('mouse') },
    ];
    const items2: OrderItem[] = [
      { productId: 'p3', name: 'Screen', unitPrice: 180, qty: 1, imageUrl: img('screen') },
    ];

    const base = (id: string, shopId: string, shopName: string, status: OrderStatus, items: OrderItem[]): AdminOrder => {
      const totals = mkTotals(items);
      return {
        id,
        createdAt: nowIso(),
        status,
        shopId,
        shopName,
        buyer: { fullName: 'Amine Ben', email: 'amine@mail.com', phone: '+212 6 00 00 00 00' },
        address: { line1: '12 Rue Hassan II', city: 'Casablanca', zip: '20000', country: 'MA' },
        items,
        ...totals,
        history: [{ status, at: nowIso() }],
      };
    };

    return [
      base('ORD-2001', 'massin', 'MassIn', 'pending', items1),
      base('ORD-2002', 'fresh', 'Fresh Market', 'confirmed', items2),
      base('ORD-2003', 'massin', 'MassIn', 'preparing', items1),
    ];
  }
}