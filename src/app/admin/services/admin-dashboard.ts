import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type GraphFilter = 'ANNUAL' | 'MONTHLY';

export interface KpiCardVM {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

export interface RevenuePoint {
  year: number;
  valueK: number;
}

export interface TopItem {
  name: string;
  valueK: number;
}

export interface TopYearVM {
  year: number;
  soldK: number;
  totalCommissions: number;
  ordersCount: number;
}

export interface TopMonthVM {
  month: string;
  year: number;
  monthNumber: number;
  totalCommissions: number;
  ordersCount: number;
}

export interface TopShopVM {
  shopId: string;
  shopName: string;
  totalCommissions: number;
  ordersCount: number;
  valueK: number;
}

export interface GraphPoint {
  key: number;
  label: string;
  value: number;
  ordersCount: number;
}

export interface GraphVM {
  filter: GraphFilter;
  year: number;
  month?: number;
  points: GraphPoint[];
  chartPoints: RevenuePoint[];
}

export interface AdminDashboardVM {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  rejectedShops: number;
  bannedShops: number;
  kpiTotalShops: KpiCardVM;
  kpiPendingShops: KpiCardVM;
  kpiBannedShops: KpiCardVM;
  topMagasins: TopItem[];
  topShops: TopShopVM[];
  topMonth: TopMonthVM | null;
  topYear: TopYearVM | null;
}

interface ShopsKpisResponse {
  totalShops: number;
  totalActiveShops: number;
  totalPendingShops: number;
  totalRejectedShops: number;
  totalSuspendedShops: number;
}

interface DashboardSummaryResponse {
  topYear: {
    year: number;
    totalCommissions: number;
    ordersCount: number;
  } | null;
  topMonth: {
    year: number;
    month: number;
    monthName?: string;
    totalCommissions: number;
    ordersCount: number;
  } | null;
  topShops: Array<{
    shopId: string;
    shopName?: string;
    totalCommissions: number;
    ordersCount: number;
  }>;
}

interface AnnualGraphResponse {
  filter: 'ANNUAL';
  year: number;
  points: Array<{
    month: number;
    totalCommissions: number;
    ordersCount: number;
  }>;
}

interface MonthlyGraphResponse {
  filter: 'MONTHLY';
  year: number;
  month: number;
  points: Array<{
    day: number;
    totalCommissions: number;
    ordersCount: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly monthLabels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  loadDashboard(limit = 3): Observable<AdminDashboardVM> {
    const params = new HttpParams().set('limit', String(limit));

    return forkJoin({
      summary: this.http.get<DashboardSummaryResponse>(`${this.apiUrl}fees/dashboard`, {
        params,
        withCredentials: true,
      }),
      shopKpis: this.http.get<ShopsKpisResponse>(`${this.apiUrl}shops/KPIs`, {
        withCredentials: true,
      }),
    }).pipe(
      map(({ summary, shopKpis }) => {
        const topShops = (summary.topShops ?? []).slice(0, limit).map((shop) => this.mapTopShop(shop));

        return {
          totalShops: Number(shopKpis.totalShops ?? 0),
          activeShops: Number(shopKpis.totalActiveShops ?? 0),
          pendingShops: Number(shopKpis.totalPendingShops ?? 0),
          rejectedShops: Number(shopKpis.totalRejectedShops ?? 0),
          bannedShops: Number(shopKpis.totalSuspendedShops ?? 0),
          kpiTotalShops: {
            title: 'Total shops',
            percent: Number(shopKpis.totalShops ?? 0),
            trend: Number(shopKpis.totalActiveShops ?? 0) > 0 ? 'up' : undefined,
            subtitle: `${Number(shopKpis.totalActiveShops ?? 0)} active / ${Number(shopKpis.totalShops ?? 0)} total`,
            linkText: 'Shop distribution',
          },
          kpiPendingShops: {
            title: 'Pending shops',
            percent: Number(shopKpis.totalPendingShops ?? 0),
            subtitle: `${Number(shopKpis.totalRejectedShops ?? 0)} rejected`,
            linkText: 'Pending requests',
          },
          kpiBannedShops: {
            title: 'Banned shops',
            percent: Number(shopKpis.totalSuspendedShops ?? 0),
            subtitle: `${Number(shopKpis.totalActiveShops ?? 0)} active shops`,
            linkText: 'Suspended shops',
          },
          topMagasins: topShops.map<TopItem>((shop) => ({
            name: shop.shopName,
            valueK: shop.valueK,
          })),
          topShops,
          topMonth: this.mapTopMonth(summary.topMonth),
          topYear: this.mapTopYear(summary.topYear),
        };
      })
    );
  }

  loadFeesGraphAnnual(year: number): Observable<GraphVM> {
    const params = new HttpParams()
      .set('filter', 'ANNUAL')
      .set('year', String(year));

    return this.http
      .get<AnnualGraphResponse>(`${this.apiUrl}fees/dashboard/fees-graph`, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          filter: 'ANNUAL',
          year: Number(response.year ?? year),
          points: (response.points ?? []).map((point) => ({
            key: Number(point.month ?? 0),
            label: this.monthLabels[Math.max(Number(point.month ?? 1) - 1, 0)] ?? String(point.month ?? ''),
            value: Number(point.totalCommissions ?? 0),
            ordersCount: Number(point.ordersCount ?? 0),
          })),
          chartPoints: (response.points ?? []).map((point) => ({
            year: Number(point.month ?? 0),
            valueK: this.toK(Number(point.totalCommissions ?? 0)),
          })),
        }))
      );
  }

  loadFeesGraphMonthly(year: number, month: number): Observable<GraphVM> {
    const params = new HttpParams()
      .set('filter', 'MONTHLY')
      .set('year', String(year))
      .set('month', String(month));

    return this.http
      .get<MonthlyGraphResponse>(`${this.apiUrl}fees/dashboard/fees-graph`, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((response) => ({
          filter: 'MONTHLY',
          year: Number(response.year ?? year),
          month: Number(response.month ?? month),
          points: (response.points ?? []).map((point) => ({
            key: Number(point.day ?? 0),
            label: String(point.day ?? ''),
            value: Number(point.totalCommissions ?? 0),
            ordersCount: Number(point.ordersCount ?? 0),
          })),
          chartPoints: (response.points ?? []).map((point) => ({
            year: Number(point.day ?? 0),
            valueK: this.toK(Number(point.totalCommissions ?? 0)),
          })),
        }))
      );
  }

  private mapTopShop(raw: DashboardSummaryResponse['topShops'][number]): TopShopVM {
    const shopName = (raw.shopName ?? '').trim() || 'Unknown shop';

    return {
      shopId: String(raw.shopId ?? ''),
      shopName,
      totalCommissions: Number(raw.totalCommissions ?? 0),
      ordersCount: Number(raw.ordersCount ?? 0),
      valueK: this.toK(Number(raw.totalCommissions ?? 0)),
    };
  }

  private mapTopYear(raw: DashboardSummaryResponse['topYear']): TopYearVM | null {
    if (!raw) return null;

    const totalCommissions = Number(raw.totalCommissions ?? 0);

    return {
      year: Number(raw.year ?? 0),
      soldK: this.toK(totalCommissions),
      totalCommissions,
      ordersCount: Number(raw.ordersCount ?? 0),
    };
  }

  private mapTopMonth(raw: DashboardSummaryResponse['topMonth']): TopMonthVM | null {
    if (!raw) return null;

    const monthNumber = Number(raw.month ?? 0);
    const fallbackLabel = this.monthLabels[Math.max(monthNumber - 1, 0)] ?? 'No month';
    const monthName = (raw.monthName ?? '').trim() || fallbackLabel;

    return {
      month: monthName,
      year: Number(raw.year ?? 0),
      monthNumber,
      totalCommissions: Number(raw.totalCommissions ?? 0),
      ordersCount: Number(raw.ordersCount ?? 0),
    };
  }

  private toK(value: number): number {
    const asK = value / 1000;
    return Math.max(Math.round(asK * 10) / 10, value > 0 ? 0.1 : 0);
  }
}
