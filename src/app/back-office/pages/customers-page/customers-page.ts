import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';

import { CustomersBackService } from '../../services/customers-back';
import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';
import { CustomersListComponent } from '../../components/customers/customers-list/customers-list';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardCardComponent, KpiCardComponent, CustomersListComponent],
  templateUrl: './customers-page.html',
  styleUrls: ['./customers-page.css'],
})
export class CustomersPage {
  private service = inject(CustomersBackService);

  vm$ = this.service.vm$.pipe(
    tap(vm => this.service.ensureSelectedFirst(vm.customers))
  );

  setSearch(v: string) { this.service.setQuery({ search: v }); }
  setSort(v: 'newest'|'oldest') { this.service.setQuery({ sort: v }); }

  select(id: string) { this.service.select(id); }

  onEdit(c: any) { alert('Edit customer: ' + c.fullName); }
  onCall(c: any) { alert('Call customer: ' + c.fullName); }
  onDelete(c: any) {
    if (confirm(`Supprimer ${c.fullName} ?`)) this.service.delete(c.id);
  }
}