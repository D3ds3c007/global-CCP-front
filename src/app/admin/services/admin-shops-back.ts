import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
export type ShopStatusUpdate = 'ACTIVE' | 'SUSPENDED';
export type ShopStatusFilter = 'pending' | 'active' | 'suspended' | 'rejected';

export interface ShopCategory {
  id: string;
  name: string;
}

export interface Shop {
  _id: string;
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  status: ShopStatus;
  ownerUserId: string;
  ownerName?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string | null;
  openingHours?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  socials?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopsQuery {
  search: string;
  categoryId: string | 'all';
  status: ShopStatusFilter | 'all' | 'banned';
}

export interface AdminShopRowVM extends Shop {
  categoryName: string;
}

export interface AdminShopsVM {
  categories: ShopCategory[];
  query: ShopsQuery;
  shops: AdminShopRowVM[];
}

interface ApiShop {
  _id?: string;
  id?: string;
  name?: string;
  categoryId?: string | { _id?: string; id?: string; name?: string };
  status?: string;
  ownerUserId?: string | { _id?: string; id?: string; fullName?: string };
  description?: string;
  logoUrl?: string;
  coverUrl?: string | null;
  openingHours?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  socials?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ListShopsResponse {
  shops?: ApiShop[];
}

interface UpdateShopStatusResponse {
  shop?: ApiShop;
}

interface GetShopResponse {
  shop?: ApiShop;
}

interface ApiCategory {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminShopsBackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly querySubject = new BehaviorSubject<ShopsQuery>({
    search: '',
    categoryId: 'all',
    status: 'all',
  });
  private readonly refreshShopsSubject = new BehaviorSubject<number>(0);

  readonly query$ = this.querySubject.asObservable();
  readonly categories$ = this.http.get<ApiCategory[] | { categories?: ApiCategory[] }>(
    `${this.apiUrl}categories`,
    { withCredentials: true }
  ).pipe(
    map(res => Array.isArray(res) ? res : (res.categories ?? [])),
    map(categories => categories
      .filter(c => (c.type ?? '').toUpperCase() === 'SHOP')
      .map<ShopCategory>(c => ({
        id: this.asId(c._id ?? c.id),
        name: (c.name ?? '').toString(),
      }))
    ),
    catchError(() => of<ShopCategory[]>([])),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly shops$ = combineLatest([this.query$, this.refreshShopsSubject]).pipe(
    switchMap(([query]) => this.listShops(query)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly shopsVM$ = combineLatest([this.shops$, this.categories$]).pipe(
    map(([shops, cats]) => {
      const catMap = new Map(cats.map(c => [c.id, c.name]));
      return shops.map<AdminShopRowVM>(s => ({
        ...s,
        categoryName: s.categoryName || catMap.get(s.categoryId) || s.categoryId,
      }));
    })
  );

  readonly vm$: Observable<AdminShopsVM> = combineLatest({
    categories: this.categories$,
    query: this.query$,
    shops: this.shopsVM$,
  });

  setQuery(patch: Partial<ShopsQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  listShops(query: Partial<ShopsQuery> = {}): Observable<Shop[]> {
    let params = new HttpParams().set('limit', '100');

    if (query.search?.trim()) {
      params = params.set('q', query.search.trim());
    }
    if (query.categoryId && query.categoryId !== 'all') {
      params = params.set('categoryId', query.categoryId);
    }

    const status = this.toBackendStatus(query.status);
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ListShopsResponse>(`${this.apiUrl}shops/all`, {
      params,
      withCredentials: true,
    }).pipe(
      map(res => (res.shops ?? []).map(shop => this.normalizeShop(shop))),
      catchError(() => of<Shop[]>([]))
    );
  }

  updateShopStatus(shopId: string, status: ShopStatusUpdate): Observable<Shop> {
    return this.http.patch<UpdateShopStatusResponse>(`${this.apiUrl}shops/${shopId}/status`, { status }, {
      withCredentials: true,
    }).pipe(
      map(res => this.normalizeShop(res.shop)),
      map(shop => {
        this.refreshShopsSubject.next(Date.now());
        return shop;
      })
    );
  }

  getShopById(shopId: string): Observable<Shop> {
    return this.http.get<GetShopResponse>(`${this.apiUrl}shops/${shopId}`, {
      withCredentials: true,
    }).pipe(
      map(res => this.normalizeShop(res.shop))
    );
  }

  private normalizeShop(raw: ApiShop | undefined): Shop {
    const status = (raw?.status ?? 'PENDING').toString().toUpperCase();
    const id = this.asId(raw?._id ?? raw?.id);
    return {
      _id: id,
      id,
      name: (raw?.name ?? '').toString(),
      categoryId: this.asId(raw?.categoryId),
      categoryName: this.readName(raw?.categoryId),
      status: this.isShopStatus(status) ? status : 'PENDING',
      ownerUserId: this.asId(raw?.ownerUserId),
      ownerName: this.readFullName(raw?.ownerUserId),
      description: raw?.description ?? '',
      logoUrl: raw?.logoUrl ?? '',
      coverUrl: raw?.coverUrl ?? null,
      openingHours: raw?.openingHours ?? '',
      contact: raw?.contact ?? {},
      socials: raw?.socials ?? {},
      createdAt: raw?.createdAt,
      updatedAt: raw?.updatedAt,
    };
  }

  private toBackendStatus(status: ShopsQuery['status'] | undefined): ShopStatus | null {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'active':
        return 'ACTIVE';
      case 'suspended':
      case 'banned':
        return 'SUSPENDED';
      case 'rejected':
        return 'REJECTED';
      default:
        return null;
    }
  }

  private isShopStatus(value: string): value is ShopStatus {
    return value === 'PENDING' || value === 'ACTIVE' || value === 'SUSPENDED' || value === 'REJECTED';
  }

  private asId(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const objectValue = value as { _id?: unknown; id?: unknown };
      if (typeof objectValue._id === 'string') return objectValue._id;
      if (typeof objectValue.id === 'string') return objectValue.id;
    }
    return '';
  }

  private readName(value: unknown): string | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const obj = value as { name?: unknown };
    return typeof obj.name === 'string' && obj.name.trim() ? obj.name : undefined;
  }

  private readFullName(value: unknown): string | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const obj = value as { fullName?: unknown };
    return typeof obj.fullName === 'string' && obj.fullName.trim() ? obj.fullName : undefined;
  }
}
