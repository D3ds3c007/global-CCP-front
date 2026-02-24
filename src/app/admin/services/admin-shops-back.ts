import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export type ShopStatus = 'pending' | 'active' | 'banned';

export interface ShopCategory {
  id: string;
  name: string;
}

export interface Shop {
  id: string;
  name: string;
  categoryId: string;
  status: ShopStatus;
  logoUrl: string;
}

export interface ShopsQuery {
  search: string;
  categoryId: string | 'all';
  status: ShopStatus | 'all';
}

export interface AdminShopRowVM extends Shop {
  categoryName: string;
}

export interface AdminShopsVM {
  categories: ShopCategory[];
  query: ShopsQuery;
  shops: AdminShopRowVM[];
}

@Injectable({ providedIn: 'root' })
export class AdminShopsBackService {
  private readonly categoriesSubject = new BehaviorSubject<ShopCategory[]>([
    { id: 'tech', name: 'TECH' },
    { id: 'food', name: 'FOOD' },
    { id: 'fashion', name: 'FASHION' },
  ]);

  private readonly shopsSubject = new BehaviorSubject<Shop[]>(this.seedShops());

  private readonly querySubject = new BehaviorSubject<ShopsQuery>({
    search: '',
    categoryId: 'all',
    status: 'all',
  });

  readonly categories$ = this.categoriesSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();

  readonly shopsFiltered$ = combineLatest([this.shopsSubject, this.querySubject]).pipe(
    map(([shops, q]) => {
      const s = q.search.trim().toLowerCase();

      return shops.filter(sh => {
        const matchSearch =
          !s || sh.name.toLowerCase().includes(s) || sh.id.toLowerCase().includes(s);

        const matchCat = q.categoryId === 'all' || sh.categoryId === q.categoryId;
        const matchStatus = q.status === 'all' || sh.status === q.status;

        return matchSearch && matchCat && matchStatus;
      });
    })
  );

  readonly shopsVM$ = combineLatest([this.shopsFiltered$, this.categories$]).pipe(
    map(([shops, cats]) => {
      const catMap = new Map(cats.map(c => [c.id, c.name]));
      return shops.map<AdminShopRowVM>(s => ({
        ...s,
        categoryName: catMap.get(s.categoryId) ?? s.categoryId,
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

  updateStatus(shopId: string, status: ShopStatus) {
    const next: Shop[] = this.shopsSubject.value.map(s =>
      s.id === shopId ? { ...s, status } : s
    );
    this.shopsSubject.next(next);
  }

  private seedShops(): Shop[] {
    return [
      { id: 'massin', name: 'MassIn', categoryId: 'tech', status: 'active', logoUrl: 'https://picsum.photos/seed/massin/120/120' },
      { id: 'fresh-01', name: 'Fresh Market', categoryId: 'food', status: 'pending', logoUrl: 'https://picsum.photos/seed/fresh/120/120' },
      { id: 'mode-11', name: 'Mode11', categoryId: 'fashion', status: 'active', logoUrl: 'https://picsum.photos/seed/mode11/120/120' },
    ];
  }
}