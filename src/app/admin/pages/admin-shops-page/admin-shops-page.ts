import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminShopsBackService } from '../../services/admin-shops-back';
import { AdminShopsFiltersComponent } from '../../components/admin-shops-filters/admin-shops-filters';
import { AdminShopsTableComponent } from '../../components/admin-shops-table/admin-shops-table';

// Réutilisation component existant (back-office)
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';

@Component({
  selector: 'app-admin-shops-page',
  standalone: true,
  imports: [CommonModule, DashboardCardComponent, AdminShopsFiltersComponent, AdminShopsTableComponent],
  templateUrl: './admin-shops-page.html',
  styleUrls: ['./admin-shops-page.css'],
})
export class AdminShopsPage {
  private service = inject(AdminShopsBackService);
  vm$ = this.service.vm$;

  setQuery(patch: any) {
    this.service.setQuery(patch);
  }

  onStatusChange(e: { id: string; status: any }) {
    this.service.updateStatus(e.id, e.status);
  }
}