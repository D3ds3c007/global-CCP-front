import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface KpiCardVM {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

export interface RevenuePoint { year: number; valueK: number; }
export interface TopItem { name: string; valueK: number; }

export interface TopBuyer {
  name: string;
  company: string;
  avatarUrl: string;
}

export interface CustomerRow {
  id: string;
  fullName: string;
  company: string;
  avatarUrl: string;
  createdAt: string;
}

export interface AdminDashboardVM {
  kpiTotalShops: KpiCardVM;
  kpiPendingShops: KpiCardVM;
  kpiBannedShops: KpiCardVM;

  commissions: RevenuePoint[];
  topMagasins: TopItem[];

  topMonth: { month: string; year: number };
  topYear: { year: number; soldK: number };
  topBuyer: TopBuyer;

  quarterGoal1: number;
  quarterGoal2: number;

  topCustomers: CustomerRow[];
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  getDashboard(): Observable<AdminDashboardVM> {
    const vm: AdminDashboardVM = {
      kpiTotalShops: {
        title: 'Nombre total boutiques',
        percent: 15,
        trend: 'up',
        subtitle: 'Increase compared to last week',
        linkText: 'Revenues report →',
      },
      kpiPendingShops: {
        title: 'Boutiques en attente',
        percent: 4,
        subtitle: 'You closed 96 out of 100 deals',
        linkText: 'All deals →',
      },
      kpiBannedShops: {
        title: 'Boutiques bannis',
        percent: 4,
        subtitle: 'You closed 96 out of 100 deals',
        linkText: 'All deals →',
      },

      commissions: [
        { year: 2016, valueK: 8 },
        { year: 2017, valueK: 12 },
        { year: 2018, valueK: 45 },
        { year: 2019, valueK: 55 },
        { year: 2020, valueK: 10 },
        { year: 2021, valueK: 18 },
        { year: 2022, valueK: 60 },
        { year: 2023, valueK: 80 },
      ],

      topMagasins: [
        { name: 'MASSIN', valueK: 120 },
        { name: 'SHEIN', valueK: 80 },
        { name: 'ICE CREAM', valueK: 70 },
        { name: 'TECHNOLOGIA', valueK: 50 },
      ],

      topMonth: { month: 'November', year: 2019 },
      topYear: { year: 2023, soldK: 96 },
      topBuyer: {
        name: 'Maggie Johnson',
        company: 'Oasis Organic Inc.',
        avatarUrl: 'https://i.pravatar.cc/80?img=12',
      },

      quarterGoal1: 84,
      quarterGoal2: 84,

      topCustomers: [
        { id: 'c1', fullName: 'Chris Friedly', company: 'Supermarket Villanova', avatarUrl: 'https://i.pravatar.cc/80?img=11', createdAt: new Date().toISOString() },
        { id: 'c2', fullName: 'Maggie Johnson', company: 'Oasis Organic Inc.', avatarUrl: 'https://i.pravatar.cc/80?img=12', createdAt: new Date().toISOString() },
        { id: 'c3', fullName: 'Gael Harry', company: 'New York Finest Fruits', avatarUrl: 'https://i.pravatar.cc/80?img=13', createdAt: new Date().toISOString() },
        { id: 'c4', fullName: 'Jenna Sullivan', company: 'Walmart', avatarUrl: 'https://i.pravatar.cc/80?img=14', createdAt: new Date().toISOString() },
      ],
    };

    return of(vm).pipe(delay(200));
  }
}