import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export type CategoryType = 'SHOP' | 'PRODUCT';
export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
}

export interface CategoriesQuery {
  search: string;
  type: CategoryType | 'all';
  status: CategoryStatus | 'all';
}

export interface AdminCategoriesVM {
  query: CategoriesQuery;
  categories: Category[];
  types: (CategoryType | 'all')[];
  statuses: (CategoryStatus | 'all')[];
}

@Injectable({ providedIn: 'root' })
export class AdminCategoriesBackService {
  private readonly categoriesSubject = new BehaviorSubject<Category[]>(this.seed());
  private readonly querySubject = new BehaviorSubject<CategoriesQuery>({
    search: '',
    type: 'all',
    status: 'all',
  });

  readonly categories$ = this.categoriesSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();

  readonly types: (CategoryType | 'all')[] = ['all', 'SHOP', 'PRODUCT'];
  readonly statuses: (CategoryStatus | 'all')[] = ['all', 'active', 'inactive'];

  readonly filtered$ = combineLatest([this.categories$, this.query$]).pipe(
    map(([cats, q]) => {
      const s = q.search.trim().toLowerCase();
      return cats.filter(c => {
        const matchSearch = !s || c.name.toLowerCase().includes(s);
        const matchType = q.type === 'all' || c.type === q.type;
        const matchStatus = q.status === 'all' || c.status === q.status;
        return matchSearch && matchType && matchStatus;
      });
    })
  );

  readonly vm$: Observable<AdminCategoriesVM> = combineLatest({
    query: this.query$,
    categories: this.filtered$,
  }).pipe(
    map(vm => ({
      ...vm,
      types: this.types,
      statuses: this.statuses,
    }))
  );

  setQuery(patch: Partial<CategoriesQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  create(value: Omit<Category, 'id'>) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'cat-' + Date.now();

    const next: Category[] = [{ id, ...value }, ...this.categoriesSubject.value];
    this.categoriesSubject.next(next);
  }

  update(id: string, patch: Partial<Omit<Category, 'id'>>) {
    const next: Category[] = this.categoriesSubject.value.map(c =>
      c.id === id ? { ...c, ...patch } : c
    );
    this.categoriesSubject.next(next);
  }

  toggleStatus(id: string) {
    const next: Category[] = this.categoriesSubject.value.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === 'active' ? 'inactive' : 'active' };
    });
    this.categoriesSubject.next(next);
  }

  private seed(): Category[] {
    return [
      { id: 'c1', name: 'TECHNOLOGIE', type: 'PRODUCT', status: 'active' },
      { id: 'c2', name: 'BATIMENT', type: 'PRODUCT', status: 'inactive' },
      { id: 'c3', name: 'CUISINE', type: 'SHOP', status: 'active' },
      { id: 'c4', name: 'DRUGS', type: 'SHOP', status: 'inactive' },
    ];
  }
}