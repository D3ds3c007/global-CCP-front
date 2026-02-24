import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersBackService } from '../../services/order';
import { OrdersFiltersComponent } from '../../components/orders/orders-filters/orders-filters';
import { OrdersTableComponent } from '../../components/orders/orders-table/orders-table';
import { OrderDetailComponent } from '../../components/orders/order-detail/order-detail';
import { map, tap } from 'rxjs';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, OrdersFiltersComponent, OrdersTableComponent, OrderDetailComponent],
  templateUrl: './orders-page.html',
  styleUrls: ['./orders-page.css'],
})
export class OrdersPage {
  private service = inject(OrdersBackService);
  vm$ = this.service.vm$.pipe(
    tap(vm => this.service.ensureSelectedFirst(vm.orders))
  );

  setQuery(p: any) { this.service.setQuery(p); }
  select(id: string) { this.service.select(id); }

  advance(id: string) { this.service.advance(id); }
  cancel(id: string) { this.service.cancel(id); }

  // helpers pour le template
  nextStatus$ = this.service.selectedOrder$.pipe(map(o => (o ? this.service.nextStatus(o) : null)));
  canCancel$ = this.service.selectedOrder$.pipe(map(o => (o ? this.service.canCancel(o) : false)));
  selectedId$ = this.service.selectedId$;
}