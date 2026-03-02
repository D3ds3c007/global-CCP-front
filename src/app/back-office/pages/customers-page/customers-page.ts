import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';

import { CustomersBackService } from '../../services/customers-back';
import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';
import { CustomersListComponent } from '../../components/customers/customers-list/customers-list';
import { SelectedShopStateService } from '../../services/selected-shop-state.service';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardCardComponent, KpiCardComponent, CustomersListComponent],
  templateUrl: './customers-page.html',
  styleUrls: ['./customers-page.css'],
})
export class CustomersPage implements OnInit {
  private readonly service = inject(CustomersBackService);
  private readonly selectedShopState = inject(SelectedShopStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  loading = false;
  errorMessage: string | null = null;

  readonly vm$ = this.service.vm$.pipe(
    tap((vm) => this.service.ensureSelectedFirst(vm.customers))
  );

  ngOnInit(): void {
    const routeShopId = (this.route.snapshot.paramMap.get('shopId') ?? '').trim();
    const selectedShopId = (this.selectedShopState.snapshot?._id ?? '').trim();

    if (!routeShopId || !selectedShopId || routeShopId !== selectedShopId) {
      this.errorMessage = 'Please select a shop first.';
      if (this.isBrowser) {
        window.alert(this.errorMessage);
      }
      this.router.navigate(['/shop']);
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.service.loadShopCustomers(selectedShopId).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err: unknown) => {
        this.errorMessage = this.readError(err);
        this.loading = false;
        if (this.isBrowser) {
          window.alert(this.errorMessage);
        }
      },
    });
  }

  setSearch(value: string) {
    this.service.setQuery({ search: value });
  }

  setSort(value: 'newest' | 'oldest') {
    this.service.setQuery({ sort: value });
  }

  select(id: string) {
    this.service.select(id);
  }

  private readError(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const maybeError = err as { error?: { message?: string; error?: string }; message?: string };
      return maybeError.error?.message || maybeError.error?.error || maybeError.message || 'Failed to load customers';
    }
    return 'Failed to load customers';
  }
}
