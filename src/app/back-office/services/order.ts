import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, map, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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
  rawId: string;
  shopId: string;
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

type BackendOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

interface ApiOrderBuyer {
  _id?: string;
  fullName?: string;
  email?: string;
}

interface ApiOrderItem {
  productId: string;
  name?: string;
  qty?: number;
  priceSnapshot?: number;
  path?: string | null;
}

export interface OrderFromServer {
  _id: string;
  orderId?: string;
  buyerId?: string | ApiOrderBuyer;
  shopId?: string;
  address?: string;
  phone?: string;
  items?: ApiOrderItem[];
  total?: number;
  status?: BackendOrderStatus | string;
  createdAt?: string;
}

type OrdersListResponse = { orders?: OrderFromServer[] } | OrderFromServer[];
interface OrderUpdateResponse {
  message?: string;
  order?: OrderFromServer;
}

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

function nowIso() {
  return new Date().toISOString();
}


@Injectable({ providedIn: 'root' })
export class OrdersBackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);
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

  loadOrders(shopId?: string): Observable<OrderFromServer[]> {
    return this.http.get<OrdersListResponse>(`${this.apiUrl}orders`, { withCredentials: true }).pipe(
      map((response) => this.normalizeOrdersList(response)),
      map((orders) => (shopId ? orders.filter((order) => String(order.shopId ?? '') === shopId) : orders)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of([]);
        }
        return throwError(() => error);
      }),
      tap((orders) => this.replaceOrdersFromServer(orders))
    );
  }

  updateOrderStatus(orderId: string, nextStatus: string): Observable<OrderFromServer> {
    const serverId = this.resolveServerId(orderId);

    return this.http
      .patch<OrderUpdateResponse>(
        `${this.apiUrl}orders/${serverId}`,
        { status: nextStatus.toUpperCase() },
        { withCredentials: true }
      )
      .pipe(map((response) => this.normalizeOrderUpdate(response)));
  }

  canCancel(order: Order) {
    return order.status === 'pending';
  }

  nextStatus(order: Order): OrderStatus | null {
    if (order.status === 'cancelled' || order.status === 'delivered') return null;
    const idx = STATUS_FLOW.indexOf(order.status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  }

  advance(orderId: string): Observable<Order> {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    if (!order) return throwError(() => new Error('Order not found'));

    const next = this.nextStatus(order);
    if (!next) return throwError(() => new Error('No next status available'));

    return this.updateOrderStatus(orderId, next).pipe(map((serverOrder) => this.patchOrderFromServer(serverOrder)));
  }

  cancel(orderId: string): Observable<Order> {
    const orders = this.ordersSubject.value;
    const order = orders.find(o => o.id === orderId);
    if (!order || !this.canCancel(order)) {
      return throwError(() => new Error('Order cannot be cancelled'));
    }

    return this.updateOrderStatus(orderId, 'CANCELLED').pipe(map((serverOrder) => this.patchOrderFromServer(serverOrder)));
  }

  private replaceOrdersFromServer(orders: OrderFromServer[]): void {
    const mappedOrders = orders.map((order) => this.mapOrderFromServer(order));
    this.ordersSubject.next(mappedOrders);

    const selectedId = this.selectedIdSubject.value;
    if (selectedId && !mappedOrders.some((order) => order.id === selectedId)) {
      this.selectedIdSubject.next(null);
    }
  }

  private patchOrderFromServer(serverOrder: OrderFromServer): Order {
    const mapped = this.mapOrderFromServer(serverOrder);
    const nextOrders = this.ordersSubject.value.map((order) => {
      if (order.rawId !== mapped.rawId && order.id !== mapped.id) {
        return order;
      }

      const previousStatus = order.status;
      const shouldAppendHistory = previousStatus !== mapped.status;
      return {
        ...order,
        ...mapped,
        history: shouldAppendHistory
          ? [...order.history, { status: mapped.status, at: nowIso() }]
          : order.history,
      };
    });

    this.ordersSubject.next(nextOrders);
    return nextOrders.find((order) => order.rawId === mapped.rawId) ?? mapped;
  }

  private normalizeOrdersList(response: OrdersListResponse): OrderFromServer[] {
    if (Array.isArray(response)) {
      return response;
    }
    return Array.isArray(response.orders) ? response.orders : [];
  }

  private normalizeOrderUpdate(response: OrderUpdateResponse): OrderFromServer {
    if (response?.order && response.order._id) {
      return response.order;
    }
    throw new Error('Invalid order update response');
  }

  private mapOrderFromServer(order: OrderFromServer): Order {
    const buyer = typeof order.buyerId === 'string' ? null : order.buyerId;
    const status = this.mapStatus(order.status);
    const total = Number(order.total ?? 0);

    return {
      id: String(order.orderId ?? order._id),
      rawId: String(order._id),
      shopId: String(order.shopId ?? ''),
      createdAt: String(order.createdAt ?? nowIso()),
      status,
      buyer: {
        fullName: String(buyer?.fullName ?? 'Unknown buyer'),
        email: String(buyer?.email ?? ''),
        phone: String(order.phone ?? ''),
      },
      address: {
        line1: String(order.address ?? ''),
        city: '',
        zip: '',
        country: '',
      },
      items: (order.items ?? []).map((item) => ({
        productId: String(item.productId ?? ''),
        name: String(item.name ?? 'Item'),
        unitPrice: Number(item.priceSnapshot ?? 0),
        qty: Number(item.qty ?? 0),
        imageUrl: item.path ?? undefined,
      })),
      subtotal: total,
      shipping: 0,
      total,
      history: [{ status, at: String(order.createdAt ?? nowIso()) }],
    };
  }

  private mapStatus(status: string | undefined): OrderStatus {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === 'PENDING') return 'pending';
    if (normalized === 'CONFIRMED') return 'confirmed';
    if (normalized === 'PREPARING') return 'preparing';
    if (normalized === 'READY') return 'ready';
    if (normalized === 'DELIVERED') return 'delivered';
    if (normalized === 'CANCELLED') return 'cancelled';
    return 'pending';
  }

  private resolveServerId(orderId: string): string {
    const order = this.ordersSubject.value.find((item) => item.id === orderId || item.rawId === orderId);
    return order?.rawId ?? orderId;
  }
}