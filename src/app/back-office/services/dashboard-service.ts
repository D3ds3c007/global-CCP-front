import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type ShopStatus = 'PENDING' | 'ACTIVE';

export interface KpiCard {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

export interface TopProduct {
  name: string;
  valueK: number;
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
  PENDING: number;
  confirmed: number;
  delivered: number;
}

export type OrderStatus = 'PENDING' | 'confirmed' | 'delivered';

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface OwnerDashboardVM {
  // screenshot
  kpiProcessed: KpiCard;
  kpiPENDING: KpiCard;
  kpiDELIVERED: KpiCard;
  topProducts: TopProduct[];
  revenue: RevenuePoint[];
  topBuyer: TopBuyer;
  // en plus
  shopStatus: ShopStatus;
  lowStock: LowStockProduct[];
  lastOrders: Order[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  getOwnerDashboard(shopId: string): Observable<OwnerDashboardVM> {
    // petite variation selon shopId (simulation)
    const seed = this.hash(shopId);
    const rand = (min: number, max: number) => min + ((seed % 100) / 100) * (max - min);

    const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

    const vm: OwnerDashboardVM = {
      kpiProcessed: {
        title: 'Total des commmande traitee',
        percent: Math.round(rand(10, 25)),
        trend: 'up',
        subtitle: 'Increase compared to last week',
        linkText: '',
      },

      kpiPENDING: {
        title: 'Commande en attente',
        percent: Math.round(rand(1, 10)),
        subtitle: 'You closed 96 out of 100 deals',
        linkText: '',
      },
      kpiDELIVERED: {
        title: 'Commande livrée',
        percent: Math.round(rand(1, 10)),
        subtitle: 'You closed 96 out of 100 deals',
        linkText: '',
      },

      topProducts: [
        { name: 'COMPUTER', valueK: 120 },
        { name: 'KEYBOARD', valueK: 80 },
        { name: 'SCREEN', valueK: 70 },
        { name: 'MOUSE', valueK: 50 },
      ],

      revenue: years.map((y, i) => ({
        year: y,
        valueK: Math.round(10 + i * 8 + rand(0, 18)),
      })),

      topBuyer: {
        name: 'Maggie Johnson',
        company: 'Oasis Organic Inc.',
        avatarUrl: 'https://i.pravatar.cc/80?img=12',
      },

      shopStatus: seed % 2 === 0 ? 'ACTIVE' : 'PENDING',

      lowStock: [
        { id: 'p1', name: 'Keyboard', stock: 3, minStock: 10 },
        { id: 'p2', name: 'Mouse', stock: 5, minStock: 15 },
      ],

      lastOrders: [
        { id: `ORD-${1000 + (seed % 80)}`, customer: 'Amine', total: 120, status: 'PENDING', createdAt: new Date().toISOString() },
        { id: `ORD-${1001 + (seed % 80)}`, customer: 'Sara', total: 260, status: 'confirmed', createdAt: new Date().toISOString() },
      ],
    };

    return of(vm).pipe(delay(200));
  }

  private hash(s: string): number {
    // hash simple pour varier les données selon shopId
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
}