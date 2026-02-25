import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';

import { AdminCustomersBackService } from '../../services/admin-customers-back';
import { AdminCustomersListComponent } from '../../components/admin-customers/admin-customers-list/admin-customers-list';

// reuse existing components
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../../back-office/components/dashboard/kpi-card/kpi-card';

@Component({
  selector: 'app-admin-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardCardComponent,
    KpiCardComponent,
    AdminCustomersListComponent,
  ],
  templateUrl: './admin-customers-page.html',
  styleUrls: ['./admin-customers-page.css'],
})
export class AdminCustomersPage {
  private service = inject(AdminCustomersBackService);

  vm$ = this.service.vm$.pipe(
    tap(vm => this.service.ensureSelectedFirst(vm.customers))
  );

  setSort(v: 'newest' | 'oldest') {
    this.service.setQuery({ sort: v });
  }

  setSearch(v: string) {
    this.service.setQuery({ search: v });
  }

  select(id: string) { this.service.select(id); }
  toggleStatus(id: string) { this.service.toggleStatus(id); }
  remove(id: string) {
    if (confirm('Delete this customer?')) this.service.delete(id);
  }
}