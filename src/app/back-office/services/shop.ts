import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export type ShopStatus = 'pending' | 'active';

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

export interface ShopsVM {
  categories: ShopCategory[];
  query: ShopsQuery;
  shops: Shop[];
}

@Injectable({ providedIn: 'root' })
export class ShopsBackService {
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
        const matchSearch = !s || sh.name.toLowerCase().includes(s);
        const matchCat = q.categoryId === 'all' || sh.categoryId === q.categoryId;
        const matchStatus = q.status === 'all' || sh.status === q.status;
        return matchSearch && matchCat && matchStatus;
      });
    })
  );

  readonly vm$: Observable<ShopsVM> = combineLatest({
    categories: this.categories$,
    query: this.query$,
    shops: this.shopsFiltered$,
  });

  setQuery(patch: Partial<ShopsQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  create(value: Omit<Shop, 'id'>) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'shop-' + Date.now();

    const next: Shop[] = [{ id, ...value }, ...this.shopsSubject.value];
    this.shopsSubject.next(next);
  }

  private seedShops(): Shop[] {
    return [
      { id: 'massin', name: 'MassIn', categoryId: 'tech', status: 'active', logoUrl: 'https://picsum.photos/seed/massin/120/120' },
      { id: 'fresh', name: 'Fresh Market', categoryId: 'food', status: 'pending', logoUrl: 'https://picsum.photos/seed/fresh/120/120' },
    ];
  }
}