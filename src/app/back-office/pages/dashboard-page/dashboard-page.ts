import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap } from 'rxjs';

import { DashboardService } from '../../services/dashboard-service';

import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';
import { QuarterGoalComponent } from '../../components/dashboard/quarter-goal/quarter-goal';
import { TopProductsComponent } from '../../components/dashboard/top-products/top-products';
import { RevenueChartComponent } from '../../components/dashboard/revenue-chart/revenue-chart';
import { MiniTileComponent } from '../../components/dashboard/mini-tile/mini-tile';
import { TopBuyerTileComponent } from '../../components/dashboard/top-buyer-tile/top-buyer-tile';
import { ShopStatusBadgeComponent } from '../../components/dashboard/shop-status-badge/shop-status-badge';
import { StatsCardsComponent } from '../../components/dashboard/stats-cards/stats-cards';
import { LowStockComponent } from '../../components/dashboard/low-stock/low-stock';
import { LastOrdersTableComponent } from '../../components/dashboard/last-orders-table/last-orders-table';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    KpiCardComponent,
    QuarterGoalComponent,
    TopProductsComponent,
    RevenueChartComponent,
    MiniTileComponent,
    TopBuyerTileComponent,
    ShopStatusBadgeComponent,
    StatsCardsComponent,
    LowStockComponent,
    LastOrdersTableComponent,
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage {
  private route = inject(ActivatedRoute);
  private ds = inject(DashboardService);

  vm$ = this.route.paramMap.pipe(
    // on récupère shopId
    switchMap((params) => {
      const shopId = params.get('shopId');
      if (!shopId) throw new Error('shopId manquant dans l’URL');
      return this.ds.getOwnerDashboard(shopId);
    })
  );
}