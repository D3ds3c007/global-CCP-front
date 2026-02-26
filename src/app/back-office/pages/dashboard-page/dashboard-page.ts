import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, filter, map, of, startWith, switchMap } from 'rxjs';

import { DashboardService, Order, RevenueFilter, RevenuePoint } from '../../services/dashboard-service';
import { SelectedShopStateService } from '../../services/selected-shop-state.service';

import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';
import { TopProductsComponent } from '../../components/dashboard/top-products/top-products';
import { RevenueChartComponent } from '../../components/dashboard/revenue-chart/revenue-chart';
import { MiniTileComponent } from '../../components/dashboard/mini-tile/mini-tile';
import { TopBuyerTileComponent } from '../../components/dashboard/top-buyer-tile/top-buyer-tile';
import { ShopStatusBadgeComponent } from '../../components/dashboard/shop-status-badge/shop-status-badge';
import { LowStockComponent } from '../../components/dashboard/low-stock/low-stock';
import { LastOrdersTableComponent } from '../../components/dashboard/last-orders-table/last-orders-table';

type AsyncBlockState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  empty: boolean;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    KpiCardComponent,
    TopProductsComponent,
    RevenueChartComponent,
    MiniTileComponent,
    TopBuyerTileComponent,
    ShopStatusBadgeComponent,
    LowStockComponent,
    LastOrdersTableComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage {
  private readonly route = inject(ActivatedRoute);
  private readonly selectedShopState = inject(SelectedShopStateService);
  private readonly ds = inject(DashboardService);

  revenueFilter: RevenueFilter = 'month';
  private readonly revenueFilterSubject = new BehaviorSubject<RevenueFilter>(this.revenueFilter);
  readonly revenueFilter$ = this.revenueFilterSubject.asObservable();
  revenueYear = 2026;
  private readonly revenueYearSubject = new BehaviorSubject<number>(this.revenueYear);
  readonly revenueYear$ = this.revenueYearSubject.asObservable();

  readonly loading$ = this.ds.loading$;
  readonly error$ = this.ds.error$;

  readonly contextError$ = combineLatest([this.route.paramMap, this.selectedShopState.selectedShop$]).pipe(
    map(([params, selected]) => {
      const routeShopId = params.get('shopId');
      if (!selected?._id) return 'No selected shop context. Please select a shop first.';
      if (routeShopId && routeShopId !== selected._id) return 'Selected shop does not match the dashboard route. Please reselect a shop.';
      return null;
    })
  );

  private readonly selectedShopId$ = combineLatest([this.route.paramMap, this.selectedShopState.selectedShop$]).pipe(
    map(([params, selected]) => {
      const routeShopId = params.get('shopId');
      if (!selected?._id) return null;
      if (routeShopId && routeShopId !== selected._id) return null;
      return selected._id;
    }),
    filter((shopId): shopId is string => !!shopId)
  );

  readonly vm$ = combineLatest([this.route.paramMap, this.selectedShopState.selectedShop$, this.revenueFilter$]).pipe(
    filter(([params, selected]) => {
      const routeShopId = params.get('shopId');
      return !!selected?._id && (!routeShopId || routeShopId === selected._id);
    }),
    switchMap(([, , revenueFilter]) => this.ds.getOwnerDashboard(revenueFilter))
  );

  readonly latestOrdersState$ = this.selectedShopId$.pipe(
    switchMap((shopId) =>
      this.ds.getLatestOrders(shopId).pipe(
        map((orders) => this.toState<Order[]>(orders)),
        startWith(this.loadingState<Order[]>([])),
        catchError((err: unknown) => of(this.errorState<Order[]>([], this.readError(err))))
      )
    )
  );

  readonly monthlyRevenueState$ = combineLatest([this.selectedShopId$, this.revenueYear$]).pipe(
    switchMap(([shopId, year]) =>
      this.ds.getMonthlyRevenue(shopId, year).pipe(
        map((points) => this.toState<RevenuePoint[]>(points, points.every((p) => p.valueK <= 0))),
        startWith(this.loadingState<RevenuePoint[]>([])),
        catchError((err: unknown) => of(this.errorState<RevenuePoint[]>([], this.readError(err))))
      )
    )
  );

  setRevenueFilter(value: string): void {
    const next: RevenueFilter = value === 'year' ? 'year' : 'month';
    if (next === this.revenueFilter) return;

    this.revenueFilter = next;
    this.revenueFilterSubject.next(next);
  }

  setRevenueYear(value: string | number): void {
    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    const next = Number.isFinite(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : 2026;
    if (next === this.revenueYear) return;
    this.revenueYear = next;
    this.revenueYearSubject.next(next);
  }

  private loadingState<T>(data: T): AsyncBlockState<T> {
    return { data, loading: true, error: null, empty: false };
  }

  private errorState<T>(data: T, error: string): AsyncBlockState<T> {
    return { data, loading: false, error, empty: false };
  }

  private toState<T extends unknown[]>(data: T, empty = data.length === 0): AsyncBlockState<T> {
    return { data, loading: false, error: null, empty };
  }

  private readError(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const maybeError = err as { error?: { message?: string }; message?: string };
      return maybeError.error?.message || maybeError.message || 'Failed to load block';
    }
    return 'Failed to load block';
  }
}
