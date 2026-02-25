import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export type CustomerType = 'SHOP_OWNER' | 'BUYER';
export type CustomerStatus = 'active' | 'inactive' | 'banned';
export type SortDir = 'newest' | 'oldest';

export interface AdminCustomer {
  id: string;
  fullName: string;
  company: string;
  avatarUrl: string;
  type: CustomerType;
  status: CustomerStatus;
  createdAt: string; // ISO
}

export interface AdminCustomersQuery {
  search: string;
  sort: SortDir;
  type: CustomerType | 'all';
  status: CustomerStatus | 'all';
}

export interface KpiCardVM {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

export interface AdminCustomersVM {
  kpi1: KpiCardVM;
  kpi2: KpiCardVM;
  query: AdminCustomersQuery;
  customers: AdminCustomer[];
  selectedId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminCustomersBackService {
  private readonly customersSubject = new BehaviorSubject<AdminCustomer[]>(this.seed());
  private readonly querySubject = new BehaviorSubject<AdminCustomersQuery>({
    search: '',
    sort: 'newest',
    type: 'all',
    status: 'all',
  });
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly customers$ = this.customersSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  readonly customersFiltered$ = combineLatest([this.customers$, this.query$]).pipe(
    map(([customers, q]) => {
      const s = q.search.trim().toLowerCase();

      const filtered = customers.filter(c => {
        const matchSearch =
          !s || c.fullName.toLowerCase().includes(s) || c.company.toLowerCase().includes(s);

        const matchType = q.type === 'all' || c.type === q.type;
        const matchStatus = q.status === 'all' || c.status === q.status;

        return matchSearch && matchType && matchStatus;
      });

      return [...filtered].sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return q.sort === 'newest' ? db - da : da - db;
      });
    })
  );

  readonly vm$: Observable<AdminCustomersVM> = combineLatest({
    query: this.query$,
    customers: this.customersFiltered$,
    selectedId: this.selectedId$,
  }).pipe(
    map(vm => ({
      ...vm,
      kpi1: {
        title: 'Total des commmande traitee',
        percent: 15,
        trend: 'up',
        subtitle: 'Increase compared to last week',
        linkText: 'Revenues report →',
      },
      kpi2: {
        title: 'Commande en attente',
        percent: 4,
        subtitle: 'You closed 96 out of 100 deals',
        linkText: 'All deals →',
      },
    }))
  );

  setQuery(patch: Partial<AdminCustomersQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  select(id: string) {
    this.selectedIdSubject.next(id);
  }

  ensureSelectedFirst(list: AdminCustomer[]) {
    if (!this.selectedIdSubject.value && list.length) {
      this.selectedIdSubject.next(list[0].id);
    }
  }

  toggleStatus(id: string) {
    const next: AdminCustomer[] = this.customersSubject.value.map((c): AdminCustomer => {
      if (c.id !== id) return c;

      // IMPORTANT: on force le type union (pas string)
      const status: CustomerStatus =
        c.status === 'active' ? 'inactive' : 'active';

      return { ...c, status };
    });

    this.customersSubject.next(next);
  }

  delete(id: string) {
    const next: AdminCustomer[] = this.customersSubject.value.filter(c => c.id !== id);
    this.customersSubject.next(next);

    if (this.selectedIdSubject.value === id) {
      this.selectedIdSubject.next(next[0]?.id ?? null);
    }
  }

  private seed(): AdminCustomer[] {
    const a = (img: number) => `https://i.pravatar.cc/80?img=${img}`;
    const now = Date.now();

    const data: AdminCustomer[] = [
      {
        id: 'c1',
        fullName: 'Chris Friedly',
        company: 'Supermarket Villanova',
        avatarUrl: a(11),
        type: 'BUYER',
        status: 'active',
        createdAt: new Date(now - 1 * 86400000).toISOString(),
      },
      {
        id: 'c2',
        fullName: 'Maggie Johnson',
        company: 'Oasis Organic Inc.',
        avatarUrl: a(12),
        type: 'SHOP_OWNER',
        status: 'active',
        createdAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: 'c3',
        fullName: 'Gael Harry',
        company: 'New York Finest Fruits',
        avatarUrl: a(13),
        type: 'BUYER',
        status: 'active',
        createdAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        id: 'c4',
        fullName: 'Jenna Sullivan',
        company: 'Walmart',
        avatarUrl: a(14),
        type: 'BUYER',
        status: 'banned',
        createdAt: new Date(now - 4 * 86400000).toISOString(),
      },
    ];

    return data;
  }
}