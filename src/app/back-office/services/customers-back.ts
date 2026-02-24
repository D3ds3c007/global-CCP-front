import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export type SortDir = 'newest' | 'oldest';

export interface Customer {
  id: string;
  fullName: string;
  company: string;
  avatarUrl: string;
  createdAt: string; // ISO (pour "Sort by Newest")
}

export interface CustomersQuery {
  search: string;
  sort: SortDir;
}

export interface KpiCard {
  title: string;
  percent: number;
  trend?: 'up' | 'down';
  subtitle: string;
  linkText: string;
}

@Injectable({ providedIn: 'root' })
export class CustomersBackService {
  private readonly customersSubject = new BehaviorSubject<Customer[]>(this.seed());
  private readonly querySubject = new BehaviorSubject<CustomersQuery>({ search: '', sort: 'newest' });
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly customers$ = this.customersSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  readonly kpi1: KpiCard = {
    title: 'Total des commande traitee',
    percent: 15,
    trend: 'up',
    subtitle: 'Increase compared to last week',
    linkText: 'Revenues report →',
  };

  readonly kpi2: KpiCard = {
    title: 'Commande en attente',
    percent: 4,
    subtitle: 'You closed 96 out of 100 deals',
    linkText: 'All deals →',
  };

  readonly customersFiltered$ = combineLatest([this.customers$, this.query$]).pipe(
    map(([customers, q]) => {
      const s = q.search.trim().toLowerCase();

      const filtered = customers.filter(c =>
        !s ||
        c.fullName.toLowerCase().includes(s) ||
        c.company.toLowerCase().includes(s)
      );

      const sorted = [...filtered].sort((a, b) => {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return q.sort === 'newest' ? db - da : da - db;
      });

      return sorted;
    })
  );

  readonly vm$ = combineLatest({
    kpi1: new BehaviorSubject(this.kpi1),
    kpi2: new BehaviorSubject(this.kpi2),
    query: this.query$,
    selectedId: this.selectedId$,
    customers: this.customersFiltered$,
  });

  setQuery(patch: Partial<CustomersQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  select(id: string) {
    this.selectedIdSubject.next(id);
  }

  ensureSelectedFirst(list: Customer[]) {
    if (!this.selectedIdSubject.value && list.length) {
      this.selectedIdSubject.next(list[0].id);
    }
  }

  delete(id: string) {
    const next = this.customersSubject.value.filter(c => c.id !== id);
    this.customersSubject.next(next);
    if (this.selectedIdSubject.value === id) this.selectedIdSubject.next(next[0]?.id ?? null);
  }

  private seed(): Customer[] {
    const a = (img: number) => `https://i.pravatar.cc/80?img=${img}`;
    const now = Date.now();
    return [
      { id: 'c1', fullName: 'Chris Friedly',  company: 'Supermarket Villanova', avatarUrl: a(11), createdAt: new Date(now - 1*86400000).toISOString() },
      { id: 'c2', fullName: 'Maggie Johnson', company: 'Oasis Organic Inc.',     avatarUrl: a(12), createdAt: new Date(now - 2*86400000).toISOString() },
      { id: 'c3', fullName: 'Gael Harry',     company: 'New York Finest Fruits', avatarUrl: a(13), createdAt: new Date(now - 3*86400000).toISOString() },
      { id: 'c4', fullName: 'Jenna Sullivan', company: 'Walmart',                avatarUrl: a(14), createdAt: new Date(now - 4*86400000).toISOString() },
    ];
  }
}
