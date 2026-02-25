import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, switchMap, tap } from 'rxjs';

import { DashboardService, RevenueFilter } from '../../services/dashboard-service';
import { SelectedShopContext, SelectedShopStateService } from '../../services/selected-shop-state.service';

import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';
import { TopProductsComponent } from '../../components/dashboard/top-products/top-products';
import { RevenueChartComponent } from '../../components/dashboard/revenue-chart/revenue-chart';
import { MiniTileComponent } from '../../components/dashboard/mini-tile/mini-tile';
import { TopBuyerTileComponent } from '../../components/dashboard/top-buyer-tile/top-buyer-tile';
import { ShopStatusBadgeComponent } from '../../components/dashboard/shop-status-badge/shop-status-badge';
import { LowStockComponent } from '../../components/dashboard/low-stock/low-stock';
import { LastOrdersTableComponent } from '../../components/dashboard/last-orders-table/last-orders-table';

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
  private readonly router = inject(Router);
  private readonly selectedShopState = inject(SelectedShopStateService);
  private readonly ds = inject(DashboardService);

  revenueFilter: RevenueFilter = 'month';
  private readonly revenueFilterSubject = new BehaviorSubject<RevenueFilter>(this.revenueFilter);
  readonly revenueFilter$ = this.revenueFilterSubject.asObservable();

  readonly loading$ = this.ds.loading$;
  readonly error$ = this.ds.error$;

  private readonly shopContext$ = this.selectedShopState.selectedShop$.pipe(
    tap((shop) => {
      if (!shop?._id) {
        void this.router.navigate(['/shop']);
      }
    }),
    filter((shop): shop is SelectedShopContext => !!shop && !!shop._id)
  );

  readonly vm$ = combineLatest([this.route.paramMap, this.shopContext$, this.revenueFilter$]).pipe(
    tap(([params, shop]) => {
      const routeShopId = params.get('shopId');
      if (routeShopId && routeShopId !== shop._id) {
        void this.router.navigate(['/shop']);
      }
    }),
    filter(([params, shop]) => {
      const routeShopId = params.get('shopId');
      return !routeShopId || routeShopId === shop._id;
    }),
    switchMap(([, , revenueFilter]) => this.ds.getOwnerDashboard(revenueFilter))
  );

  setRevenueFilter(value: string): void {
    const next: RevenueFilter = value === 'year' ? 'year' : 'month';
    if (next === this.revenueFilter) return;

    this.revenueFilter = next;
    this.revenueFilterSubject.next(next);
  }
}
