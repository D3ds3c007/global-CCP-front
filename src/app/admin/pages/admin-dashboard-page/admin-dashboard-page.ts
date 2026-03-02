import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, catchError, combineLatest, map, of, shareReplay, startWith, switchMap } from 'rxjs';

import {
  AdminDashboardService,
  AdminDashboardVM,
  GraphFilter,
  GraphVM,
  TopShopVM,
} from '../../services/admin-dashboard';

import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../../back-office/components/dashboard/kpi-card/kpi-card';
import { RevenueChartComponent } from '../../../back-office/components/dashboard/revenue-chart/revenue-chart';
import { TopProductsComponent } from '../../../back-office/components/dashboard/top-products/top-products';
import { MiniTileComponent } from '../../../back-office/components/dashboard/mini-tile/mini-tile';

interface LoadState<T> {
  loading: boolean;
  data: T | null;
  error: string | null;
}

interface SelectOption {
  value: number;
  label: string;
}

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
  ],
  templateUrl: './admin-dashboard-page.html',
  styleUrls: ['./admin-dashboard-page.css'],
})
export class AdminDashboardPage {
  private readonly ds = inject(AdminDashboardService);
  private readonly now = new Date();
  private readonly currentYear = this.now.getFullYear();
  private readonly currentMonth = this.now.getMonth() + 1;

  private readonly graphFilterSubject = new BehaviorSubject<GraphFilter>('ANNUAL');
  private readonly selectedYearSubject = new BehaviorSubject<number>(this.currentYear);
  private readonly selectedMonthSubject = new BehaviorSubject<number>(this.currentMonth);

  readonly graphFilter$ = this.graphFilterSubject.asObservable();
  readonly selectedYear$ = this.selectedYearSubject.asObservable();
  readonly selectedMonth$ = this.selectedMonthSubject.asObservable();

  readonly years: SelectOption[] = Array.from({ length: 5 }, (_, index) => {
    const year = this.currentYear - index;
    return { value: year, label: String(year) };
  });

  readonly months: SelectOption[] = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly dashboardState$ = this.ds.loadDashboard(3).pipe(
    map((data): LoadState<AdminDashboardVM> => ({
      loading: false,
      data,
      error: null,
    })),
    startWith<LoadState<AdminDashboardVM>>({
      loading: true,
      data: null,
      error: null,
    }),
    catchError((error: unknown) =>
      of<LoadState<AdminDashboardVM>>({
        loading: false,
        data: null,
        error: this.readErrorMessage(error),
      })
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly graphState$ = combineLatest([
    this.graphFilter$,
    this.selectedYear$,
    this.selectedMonth$,
  ]).pipe(
    switchMap(([filter, year, month]) =>
      (filter === 'ANNUAL' ? this.ds.loadFeesGraphAnnual(year) : this.ds.loadFeesGraphMonthly(year, month)).pipe(
        map((data): LoadState<GraphVM> => ({
          loading: false,
          data,
          error: null,
        })),
        startWith<LoadState<GraphVM>>({
          loading: true,
          data: null,
          error: null,
        }),
        catchError((error: unknown) =>
          of<LoadState<GraphVM>>({
            loading: false,
            data: null,
            error: this.readErrorMessage(error),
          })
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly pageVm$ = combineLatest({
    dashboardState: this.dashboardState$,
    graphState: this.graphState$,
    graphFilter: this.graphFilter$,
    selectedYear: this.selectedYear$,
    selectedMonth: this.selectedMonth$,
  }).pipe(
    map(({ dashboardState, graphState, graphFilter, selectedYear, selectedMonth }) => ({
      dashboardState,
      graphState,
      graphFilter,
      selectedYear,
      selectedMonth,
      years: this.years,
      months: this.months,
    }))
  );

  setGraphFilter(value: string): void {
    if (value === 'MONTHLY' || value === 'ANNUAL') {
      this.graphFilterSubject.next(value);
    }
  }

  setYear(value: string): void {
    const year = Number(value);
    if (Number.isInteger(year)) {
      this.selectedYearSubject.next(year);
    }
  }

  setMonth(value: string): void {
    const month = Number(value);
    if (Number.isInteger(month) && month >= 1 && month <= 12) {
      this.selectedMonthSubject.next(month);
    }
  }

  trackByShopId(_: number, shop: TopShopVM): string {
    return shop.shopId;
  }

  private readErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const maybeError = error as { error?: { message?: string }; message?: string };
      return maybeError.error?.message || maybeError.message || 'Unable to load dashboard.';
    }

    return 'Unable to load dashboard.';
  }
}
