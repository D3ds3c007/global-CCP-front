import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { AuthStateService } from '../../core/services/auth-state.service';

export type ShopStatus = 'PENDING' | 'ACTIVE';

export interface ShopCategory {
  id: string;
  name: string;
}
export interface contactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface category {
  id: string;
  name: string;
}

export interface Shop {
  _id: string;
  name: string;
  category: category;
  status: string;
  logoUrl: string;
  coverUrl?: string;
  ownerId: string;
  description?: string;
  contact?: contactInfo;
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
  private readonly authState = inject(AuthStateService);
  private readonly currentUser$ = this.authState.currentUser$;
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
        const matchCat = q.categoryId === 'all' || sh.category.id === q.categoryId;
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

  create(value: Omit<Shop, '_id'>) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'shop-' + Date.now();

    const next: Shop[] = [{ _id: id, ...value }, ...this.shopsSubject.value];
    this.shopsSubject.next(next);
  }

  private seedShops(): Shop[] {
    // return [
    //   { id: 'massin', name: 'MassIn', categoryId: 'tech', status: 'ACTIVE', logoUrl: 'https://picsum.photos/seed/massin/120/120' },
    //   { id: 'fresh', name: 'Fresh Market', categoryId: 'food', status: 'PENDING', logoUrl: 'https://picsum.photos/seed/fresh/120/120' },
    // ];

    //retunr shops from currentuser$
    const user = this.authState.snapshot;
    const userFromState = this.currentUser$;
    //show how to get user shops from authStatesnapshot or currentUser$ observable
    userFromState.subscribe(u => console.log('userFromState subscribe', u));
    if (!user) return [];
    let store = user.shops.map((sh: any) => ({
      _id: sh._id,
      name: sh.name,
      category: sh.category,
      status: sh.status,
      logoUrl: sh.logoUrl,
      ownerId: user.id,
    }));

    console.log('Seeded shops', store);
    return store;


  }
}