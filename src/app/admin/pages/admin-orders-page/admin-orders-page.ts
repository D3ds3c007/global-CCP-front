import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, startWith, tap } from 'rxjs';

import { AdminOrdersBackService } from '../../services/admin-orders-back';
import { AdminOrdersFiltersComponent } from '../../components/admin-orders/admin-orders-filters/admin-orders-filters';
import { AdminOrdersTableComponent } from '../../components/admin-orders/admin-orders-table/admin-orders-table';

// reuse card + detail (back-office)
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';
import { OrderDetailComponent } from '../../../back-office/components/orders/order-detail/order-detail';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    AdminOrdersFiltersComponent,
    AdminOrdersTableComponent,
    OrderDetailComponent,
  ],
  templateUrl: './admin-orders-page.html',
  styleUrls: ['./admin-orders-page.css'],
})
export class AdminOrdersPage {
  private service = inject(AdminOrdersBackService);

  vm$ = this.service.vm$.pipe(
    tap(vm => this.service.ensureSelectedFirst(vm.orders))
  );

  selectedId$ = this.service.selectedId$.pipe(startWith(null));

  nextStatus$ = this.service.selectedOrder$.pipe(
    map(o => (o ? this.service.nextStatus(o) : null)),
    startWith(null)
  );

  canCancel$ = this.service.selectedOrder$.pipe(
    map(o => (o ? this.service.canCancel(o) : false)),
    startWith(false)
  );

  setQuery(p: any) { this.service.setQuery(p); }
  select(id: string) { this.service.select(id); }

  advance(id: string) { this.service.advance(id); }
  cancel(id: string) { this.service.cancel(id); }
}