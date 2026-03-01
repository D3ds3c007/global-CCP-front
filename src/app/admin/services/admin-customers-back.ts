import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'SHOP' | 'BUYER' | 'ADMIN';
export type UserStatus = 'active' | 'banned';
export type SortDir = 'newest' | 'oldest';

export interface UserRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status?: UserStatus;
  createdAt: string;
}

interface ApiUserRow {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

interface UsersResponse {
  users?: ApiUserRow[];
  totalPages?: number;
}

export interface AdminCustomersQuery {
  search: string;
  sort: SortDir;
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
  customers: UserRow[];
  selectedId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminCustomersBackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly customersSubject = new BehaviorSubject<UserRow[]>([]);
  private readonly querySubject = new BehaviorSubject<AdminCustomersQuery>({
    search: '',
    sort: 'newest',
  });
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  readonly customers$ = this.customersSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  readonly customersFiltered$ = combineLatest([this.customers$, this.query$]).pipe(
    map(([customers, q]) => {
      const s = q.search.trim().toLowerCase();

      const filtered = customers.filter((customer) =>
        !s ||
        customer.fullName.toLowerCase().includes(s) ||
        customer.email.toLowerCase().includes(s) ||
        customer.phone.toLowerCase().includes(s) ||
        customer.role.toLowerCase().includes(s)
      );

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
    allCustomers: this.customers$,
    selectedId: this.selectedId$,
  }).pipe(
    map(({ allCustomers, ...vm }) => ({
      ...vm,
      kpi1: {
        title: 'Users',
        percent: allCustomers.length,
        subtitle: 'All registered users',
        linkText: 'Users list',
      },
      kpi2: {
        title: 'Shop owners',
        percent: allCustomers.filter((customer) => customer.role === 'SHOP').length,
        subtitle: 'Accounts with SHOP role',
        linkText: 'Role breakdown',
      },
    }))
  );

  loadUsers(): Observable<UserRow[]> {
    const limit = 100;
    return this.fetchUsersPage(1, limit).pipe(
      switchMap((firstPage) => {
        const firstUsers = firstPage.users ?? [];
        const totalPages = Math.max(Number(firstPage.totalPages ?? 1), 1);

        if (totalPages <= 1) {
          return of(firstUsers);
        }

        const remainingRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
          this.fetchUsersPage(index + 2, limit).pipe(map((response) => response.users ?? []))
        );

        return forkJoin(remainingRequests).pipe(
          map((pages) => firstUsers.concat(...pages))
        );
      }),
      map((users) => users.map((user) => this.mapUser(user))),
      tap((users) => {
        this.customersSubject.next(users);
        if (this.selectedIdSubject.value && !users.some((user) => user.id === this.selectedIdSubject.value)) {
          this.selectedIdSubject.next(users[0]?.id ?? null);
        }
      })
    );
  }

  setQuery(patch: Partial<AdminCustomersQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  select(id: string) {
    this.selectedIdSubject.next(id);
  }

  ensureSelectedFirst(list: UserRow[]) {
    if (!this.selectedIdSubject.value && list.length) {
      this.selectedIdSubject.next(list[0].id);
    }
  }

  private fetchUsersPage(page: number, limit: number): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.apiUrl}users`, {
      params: { page, limit },
      withCredentials: true,
    });
  }

  private mapUser(user: ApiUserRow): UserRow {
    const role = String(user.role ?? 'BUYER').toUpperCase() as UserRole;
    const status = String(user.status ?? '').toLowerCase();

    return {
      id: String(user.id ?? ''),
      fullName: String(user.fullName ?? ''),
      email: String(user.email ?? ''),
      phone: String(user.phone ?? ''),
      role,
      status: status === 'active' || status === 'banned' ? status : undefined,
      createdAt: String(user.createdAt ?? ''),
    };
  }
}

export { AdminCustomersBackService as AdminCustomersBack };
