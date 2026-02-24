import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardService } from '../../services/admin-dashboard';

// réutilisation des composants existants (back-office)
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../../back-office/components/dashboard/kpi-card/kpi-card';
import { RevenueChartComponent } from '../../../back-office/components/dashboard/revenue-chart/revenue-chart';
import { TopProductsComponent } from '../../../back-office/components/dashboard/top-products/top-products';
import { MiniTileComponent } from '../../../back-office/components/dashboard/mini-tile/mini-tile';
import { TopBuyerTileComponent } from '../../../back-office/components/dashboard/top-buyer-tile/top-buyer-tile';
import { QuarterGoalComponent } from '../../../back-office/components/dashboard/quarter-goal/quarter-goal';

// si tu veux réutiliser la liste customers existante :
import { CustomersListComponent } from '../../../back-office/components/customers/customers-list/customers-list';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    KpiCardComponent,
    RevenueChartComponent,
    TopProductsComponent,
    MiniTileComponent,
    TopBuyerTileComponent,
    QuarterGoalComponent,
    CustomersListComponent,
  ],
  templateUrl: './admin-dashboard-page.html',
  styleUrls: ['./admin-dashboard-page.css'],
})
export class AdminDashboardPage {
  private ds = inject(AdminDashboardService);
  vm$ = this.ds.getDashboard();
}