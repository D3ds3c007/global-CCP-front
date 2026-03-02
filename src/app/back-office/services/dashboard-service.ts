import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, defer, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SelectedShopStateService } from './selected-shop-state.service';

export type ShopStatus = 'PENDING' | 'ACTIVE';

export interface KpiCard {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

export interface TopProduct {
  productId?: string;
  name: string;
  valueK: number;
}

export interface RevenuePoint {
  year: number;
  valueK: number;
}

export interface TopBuyer {
  name: string;
  company: string;
  avatarUrl: string;
}

export interface OrderStats {
  PENDING: number;
  confirmed: number;
  delivered: number;
}

export type OrderStatus = 'PENDING' | 'confirmed' | 'delivered';

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface OwnerDashboardVM {
  kpiProcessed: KpiCard;
  kpiPENDING: KpiCard;
  kpiDELIVERED: KpiCard;
  topProducts: TopProduct[];
  revenue: RevenuePoint[];
  topBuyer: TopBuyer;
  shopStatus: ShopStatus;
  lowStock: LowStockProduct[];
  lastOrders: Order[];
}

export type RevenueFilter = 'month' | 'year';

interface OrderCountResponse {
  orders: number;
}

interface ApiLowStockProduct {
  _id: string;
  name: string;
  stock: number;
}

interface LowStockResponse {
  count: number;
  products: ApiLowStockProduct[];
}

interface ApiTopProduct {
  productId: string;
  name: string;
  totalQty: number;
  totalRevenue: number;
}

interface TopProductsResponse {
  topProducts: ApiTopProduct[];
}

interface ApiTopCustomer {
  customerId: string;
  name?: string;
  email?: string;
  totalRevenue?: number;
}

interface TopCustomersResponse {
  topCustomers: ApiTopCustomer[];
}

interface TotalRevenueResponse {
  totalRevenue: number;
}

interface ApiLatestOrderBuyer {
  _id?: string;
  fullName?: string;
  email?: string;
}

interface ApiLatestOrder {
  _id?: string;
  orderId?: string;
  buyerId?: string | ApiLatestOrderBuyer;
  total?: number;
  status?: string;
  createdAt?: string;
}

interface LatestOrdersResponse {
  orders: ApiLatestOrder[];
}

interface ApiMonthlyRevenuePoint {
  month: number;
  totalRevenue: number;
}

interface MonthlyRevenueResponse {
  monthlyRevenue: ApiMonthlyRevenuePoint[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly selectedShopState = inject(SelectedShopStateService);
  private readonly apiUrl = environment.apiUrl;

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  getLatestOrders(shopId: string): Observable<Order[]> {
    return this.http
      .get<LatestOrdersResponse>(`${this.apiUrl}orders/shop/${shopId}/latest`, { withCredentials: true })
      .pipe(map((res) => (res.orders ?? []).map((o) => this.mapLatestOrder(o))));
  }

  getMonthlyRevenue(shopId: string, year: number): Observable<RevenuePoint[]> {
    const params = new HttpParams().set('year', String(year));
    return this.http
      .get<MonthlyRevenueResponse>(`${this.apiUrl}shops/${shopId}/monthly-revenue`, { params, withCredentials: true })
      .pipe(
        map((res) =>
          (res.monthlyRevenue ?? []).map((p) => ({
            year: Number(p.month ?? 0),
            valueK: this.toK(p.totalRevenue ?? 0),
          }))
        )
      );
  }

  getOwnerDashboard(revenueFilter: RevenueFilter = 'month'): Observable<OwnerDashboardVM> {
    return defer(() => {
      const selectedShop = this.selectedShopState.snapshot;
      const shopId = selectedShop?._id;

      if (!shopId) {
        const message = 'No selected shop context.';
        this.errorSubject.next(message);
        return throwError(() => new Error(message));
      }

      const now = new Date();
      const revenueParams = this.buildRevenueParams(revenueFilter, now);

      this.loadingSubject.next(true);
      this.errorSubject.next(null);

      return forkJoin({
        pendingCount: this.getOrderCount(shopId, 'PENDING'),
        processedCount: this.getOrderCount(shopId, 'CONFIRMED'),
        deliveredCount: this.getOrderCount(shopId, 'DELIVERED'),
        lowStock: this.getLowStock(shopId),
        topProducts: this.getTopProducts(shopId),
        topCustomers: this.getTopCustomers(shopId),
        revenueTotal: this.getRevenueTotal(shopId, revenueParams),
      }).pipe(
        map((data) =>
          this.buildVm({
            shopId,
            shopStatus: this.normalizeShopStatus(selectedShop.status),
            revenueFilter,
            now,
            pendingCount: data.pendingCount,
            processedCount: data.processedCount,
            deliveredCount: data.deliveredCount,
            lowStock: data.lowStock,
            topProducts: data.topProducts,
            topCustomers: data.topCustomers,
            revenueTotal: data.revenueTotal,
          })
        ),
        catchError((err: unknown) => {
          this.errorSubject.next(this.readErrorMessage(err));
          return of(
            this.buildVm({
              shopId,
              shopStatus: this.normalizeShopStatus(selectedShop.status),
              revenueFilter,
              now,
              pendingCount: 0,
              processedCount: 0,
              deliveredCount: 0,
              lowStock: [],
              topProducts: [],
              topCustomers: [],
              revenueTotal: 0,
            })
          );
        }),
        finalize(() => this.loadingSubject.next(false))
      );
    });
  }

  private getOrderCount(shopId: string, status: 'PENDING' | 'CONFIRMED' | 'DELIVERED'): Observable<number> {
    const params = new HttpParams().set('status', status);
    return this.http
      .get<OrderCountResponse>(`${this.apiUrl}orders/shop/${shopId}`, { params, withCredentials: true })
      .pipe(map((res) => Number(res.orders ?? 0)));
  }

  private getLowStock(shopId: string): Observable<LowStockProduct[]> {
    return this.http
      .get<LowStockResponse>(`${this.apiUrl}products/low-stock/shop/${shopId}`, { withCredentials: true })
      .pipe(
        map((res) =>
          (res.products ?? [])
            .filter((p) => Number(p.stock ?? 0) < 5)
            .map((p) => ({
              id: String(p._id),
              name: String(p.name ?? ''),
              stock: Number(p.stock ?? 0),
              minStock: 5,
            }))
        ),
        catchError(() => of([]))
      );
  }

  private getTopProducts(shopId: string): Observable<TopProduct[]> {
    return this.http
      .get<TopProductsResponse>(`${this.apiUrl}shops/${shopId}/top-products-by-revenue`, { withCredentials: true })
      .pipe(
        map((res) =>
          (res.topProducts ?? []).map((p) => ({
            productId: p.productId ? String(p.productId) : undefined,
            name: String(p.name ?? 'N/A').toUpperCase(),
            valueK: this.toK(p.totalRevenue ?? 0),
          }))
        )
      );
  }

  private getTopCustomers(shopId: string): Observable<TopBuyer[]> {
    return this.http
      .get<TopCustomersResponse>(`${this.apiUrl}shops/${shopId}/top-customers`, { withCredentials: true })
      .pipe(
        map((res) =>
          (res.topCustomers ?? []).map((c) => {
            const seed = String(c.customerId ?? c.email ?? c.name ?? 'buyer');
            return {
              name: String(c.name ?? 'Unknown buyer'),
              company: String(c.email ?? 'Top customer'),
              avatarUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(seed)}`,
            };
          })
        )
      );
  }

  private getRevenueTotal(shopId: string, params: HttpParams): Observable<number> {
    return this.http
      .get<TotalRevenueResponse>(`${this.apiUrl}shops/${shopId}/total-revenue`, { params, withCredentials: true })
      .pipe(map((res) => Number(res.totalRevenue ?? 0)));
  }

  private buildRevenueParams(filter: RevenueFilter, now: Date): HttpParams {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (filter === 'year') {
      return new HttpParams().set('year', String(year));
    }

    return new HttpParams().set('year', String(year)).set('month', String(month));
  }

  private buildVm(input: {
    shopId: string;
    shopStatus: ShopStatus;
    revenueFilter: RevenueFilter;
    now: Date;
    pendingCount: number;
    processedCount: number;
    deliveredCount: number;
    lowStock: LowStockProduct[];
    topProducts: TopProduct[];
    topCustomers: TopBuyer[];
    revenueTotal: number;
  }): OwnerDashboardVM {
    const { shopId, shopStatus, revenueFilter, now } = input;

    return {
      kpiProcessed: {
        title: 'Processed orders',
        percent: input.processedCount,
        trend: input.processedCount > 0 ? 'up' : undefined,
        subtitle: 'Status CONFIRMED',
        linkText: '',
      },
      kpiPENDING: {
        title: 'Pending orders',
        percent: input.pendingCount,
        subtitle: 'Status PENDING',
        linkText: '',
      },
      kpiDELIVERED: {
        title: 'Delivered orders',
        percent: input.deliveredCount,
        subtitle: 'Status DELIVERED',
        linkText: '',
      },
      topProducts: input.topProducts,
      revenue: [
        {
          year: revenueFilter === 'month' ? now.getMonth() + 1 : now.getFullYear(),
          valueK: this.toK(input.revenueTotal),
        },
      ],
      topBuyer:
        input.topCustomers[0] ?? {
          name: 'No customer',
          company: 'No orders',
          avatarUrl: 'https://i.pravatar.cc/80?u=empty-buyer',
        },
      shopStatus,
      lowStock: input.lowStock,
      lastOrders: this.buildMockLastOrders(shopId),
    };
  }

  private buildMockLastOrders(shopId: string): Order[] {
    const seed = this.hash(shopId);
    const nowIso = new Date().toISOString();

    return [
      { id: `ORD-${1000 + (seed % 80)}`, customer: 'Amine', total: 120, status: 'PENDING', createdAt: nowIso },
      { id: `ORD-${1001 + (seed % 80)}`, customer: 'Sara', total: 260, status: 'confirmed', createdAt: nowIso },
    ];
  }

  private normalizeShopStatus(status: string | undefined): ShopStatus {
    return String(status ?? '').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'PENDING';
  }

  private toK(value: number): number {
    const asK = Number(value) / 1000;
    return Math.max(Math.round(asK * 10) / 10, value > 0 ? 0.1 : 0);
  }

  private readErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const maybeError = err as { error?: { message?: string }; message?: string };
      return maybeError.error?.message || maybeError.message || 'Dashboard load failed';
    }
    return 'Dashboard load failed';
  }

  private mapLatestOrder(order: ApiLatestOrder): Order {
    const buyer = order.buyerId;
    const customer =
      typeof buyer === 'string'
        ? buyer
        : String(buyer?.fullName ?? buyer?.email ?? 'Unknown buyer');

    return {
      id: String(order.orderId ?? order._id ?? ''),
      customer,
      total: Number(order.total ?? 0),
      status: this.normalizeLatestOrderStatus(order.status),
      createdAt: String(order.createdAt ?? new Date().toISOString()),
    };
  }

  private normalizeLatestOrderStatus(status: string | undefined): OrderStatus {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === 'PENDING') return 'PENDING';
    if (normalized === 'DELIVERED') return 'delivered';
    return 'confirmed';
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
}
