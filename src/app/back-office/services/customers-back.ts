import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, map, of, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type SortDir = 'newest' | 'oldest';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  lastOrderDate: string;
  totalOrders: number;
  totalSpent: number;
}

interface ApiCustomer {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  lastOrderDate?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface ShopCustomersResponse {
  customers?: ApiCustomer[];
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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly customersSubject = new BehaviorSubject<Customer[]>([]);
  private readonly querySubject = new BehaviorSubject<CustomersQuery>({ search: '', sort: 'newest' });
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
        customer.address.toLowerCase().includes(s)
      );

      return [...filtered].sort((a, b) => {
        const da = new Date(a.lastOrderDate).getTime();
        const db = new Date(b.lastOrderDate).getTime();
        return q.sort === 'newest' ? db - da : da - db;
      });
    })
  );

  readonly vm$ = combineLatest({
    kpi1: this.customers$.pipe(
      map((customers): KpiCard => ({
        title: 'Customers',
        percent: customers.length,
        subtitle: 'Unique buyers for this shop',
        linkText: 'Customers list',
      }))
    ),
    kpi2: this.customers$.pipe(
      map((customers): KpiCard => {
        const repeatCustomers = customers.filter((customer) => customer.totalOrders > 1).length;
        return {
          title: 'Returning customers',
          percent: repeatCustomers,
          subtitle: 'Customers with more than one order',
          linkText: 'Orders history',
        };
      })
    ),
    query: this.query$,
    selectedId: this.selectedId$,
    customers: this.customersFiltered$,
  });

  loadShopCustomers(shopId: string): Observable<Customer[]> {
    return this.http
      .get<ShopCustomersResponse>(`${this.apiUrl}shops/${shopId}/customers`, { withCredentials: true })
      .pipe(
        map((response) => (response.customers ?? []).map((customer) => this.mapCustomer(customer))),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            return of([]);
          }
          return throwError(() => error);
        }),
        tap((customers) => {
          this.customersSubject.next(customers);
          if (this.selectedIdSubject.value && !customers.some((customer) => customer.id === this.selectedIdSubject.value)) {
            this.selectedIdSubject.next(customers[0]?.id ?? null);
          }
        })
      );
  }

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

  private mapCustomer(customer: ApiCustomer): Customer {
    return {
      id: String(customer.id ?? ''),
      fullName: String(customer.fullName ?? ''),
      email: String(customer.email ?? ''),
      phone: String(customer.phone ?? ''),
      address: String(customer.address ?? ''),
      lastOrderDate: String(customer.lastOrderDate ?? ''),
      totalOrders: Number(customer.totalOrders ?? 0),
      totalSpent: Number(customer.totalSpent ?? 0),
    };
  }
}

export { CustomersBackService as CustomersBack };
