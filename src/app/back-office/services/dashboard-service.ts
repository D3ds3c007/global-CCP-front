import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
export type ShopStatus = 'pending' | 'active';

export interface KpiCard {
  title: string;
  percent: number;       // 15 => 15%
  trend?: 'up' | 'down'; // pour la flèche verte
  subtitle: string;
  linkText: string;
}

export interface TopProduct {
  name: string;
  valueK: number; // 120 => 120K
}

export interface RevenuePoint {
  year: number;
  valueK: number;
}

export interface TopBuyer {
  name: string;
  company: string;
  avatarUrl: string;
}

export interface OrderStats {
  pending: number;
  confirmed: number;
  delivered: number;
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface OwnerDashboardVM {
  // screenshot
  kpiProcessed: KpiCard;
  kpiPending: KpiCard;
  quarterGoalPercent: number;
  topProducts: TopProduct[];
  revenue: RevenuePoint[];
  topMonth: { month: string; year: number };
  topYear: { year: number; soldK: number };
  topBuyer: TopBuyer;

  // “en plus”
  shopStatus: ShopStatus;
  orderStats: OrderStats;
  lowStock: Product[];
  lastOrders: Order[];
}

export interface TopProduct { name: string; valueK: number; }
export interface RevenuePoint { year: number; valueK: number; }

export interface OwnerDashboardVM {
  quarterGoalPercent: number;
  topProducts: TopProduct[];
  revenue: RevenuePoint[];
  topMonth: { month: string; year: number };
  topYear: { year: number; soldK: number };
  topBuyer: { name: string; company: string; avatarUrl: string };

  // tes “en plus”
  shopStatus: ShopStatus;
  orderStats: { pending: number; confirmed: number; delivered: number };
  lowStock: { id: string; name: string; stock: number; minStock: number }[];
  lastOrders: { id: string; customer: string; total: number; status: 'pending'|'confirmed'|'delivered'; createdAt: string }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getOwnerDashboard(): Observable<OwnerDashboardVM> {
    const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

const vm: OwnerDashboardVM = {
  kpiProcessed: {
    title: 'Total des commmande traitee',
    percent: 15,
    trend: 'up',
    subtitle: 'Increase compared to last week',
    linkText: 'Revenues report →',
  },

  kpiPending: {
    title: 'Commande en attente',
    percent: 4,
    subtitle: 'You closed 96 out of 100 deals',
    linkText: 'All deals →',
  },

  quarterGoalPercent: 84,

  topProducts: [
    { name: 'COMPUTER', valueK: 120 },
    { name: 'KEYBOARD', valueK: 80 },
    { name: 'SCREEN', valueK: 70 },
    { name: 'MOUSE', valueK: 50 },
  ],

  revenue: [
    { year: 2016, valueK: 8 },
    { year: 2017, valueK: 12 },
    { year: 2018, valueK: 45 },
    { year: 2019, valueK: 55 },
    { year: 2020, valueK: 10 },
    { year: 2021, valueK: 18 },
    { year: 2022, valueK: 60 },
    { year: 2023, valueK: 80 },
  ],

  topMonth: { month: 'November', year: 2019 },
  topYear: { year: 2023, soldK: 96 },
  topBuyer: {
    name: 'Maggie Johnson',
    company: 'Oasis Organic Inc.',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
  },

  shopStatus: 'active',
  orderStats: { pending: 4, confirmed: 12, delivered: 45 },
  lowStock: [
    { id: 'p1', name: 'Keyboard', stock: 3, minStock: 10 },
    { id: 'p2', name: 'Mouse', stock: 5, minStock: 15 },
  ],
  lastOrders: [
    { id: 'ORD-1001', customer: 'Amine', total: 120, status: 'pending', createdAt: new Date().toISOString() },
    { id: 'ORD-1002', customer: 'Sara', total: 260, status: 'confirmed', createdAt: new Date().toISOString() },
  ],
};

    return of(vm).pipe(delay(200));
  }
}