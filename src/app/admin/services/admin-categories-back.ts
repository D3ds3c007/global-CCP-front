import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CategoryType = 'SHOP' | 'PRODUCT';
export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  _id?: string;
  id: string;
  name: string;
  type: CategoryType;
  status: CategoryStatus;
}

export interface CategorySavePayload {
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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
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

  listCategories(): Observable<Category[]> {
    return this.http.get<ApiCategory[]>(`${this.apiUrl}categories`, { withCredentials: true }).pipe(
      map((rows) => (rows ?? []).map((row) => this.mapApiCategory(row))),
      tap((categories) => this.categoriesSubject.next(categories)),
      catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
    );
  }

  createCategory(payload: CategorySavePayload): Observable<CategoryMutationResponse> {
    const body = { name: payload.name, type: payload.type };

    return this.http
      .post<ApiCategoryMutationResponse>(`${this.apiUrl}categories`, body, { withCredentials: true })
      .pipe(
        map((res) => this.mapMutationResponse(res)),
        switchMap((res) => {
          if (!res.category || payload.status === 'active') {
            return of(res);
          }

          return this.updateCategoryStatus(res.category.id, 'inactive').pipe(
            map((statusRes) => ({
              message: statusRes.message || res.message,
              category: statusRes.category ?? res.category,
            }))
          );
        }),
        tap((res) => {
          if (res.category) {
            this.prependCategory(res.category);
          }
        }),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  updateCategoryStatus(categoryId: string, nextStatus: CategoryStatus): Observable<CategoryMutationResponse> {
    return this.http
      .patch<ApiCategoryMutationResponse>(
        `${this.apiUrl}categories/${categoryId}`,
        { isActive: nextStatus === 'active' },
        { withCredentials: true }
      )
      .pipe(
        map((res) => this.mapMutationResponse(res)),
        tap((res) => {
          if (res.category) {
            this.replaceCategory(res.category);
          }
        }),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  create(value: CategorySavePayload): Observable<CategoryMutationResponse> {
    return this.createCategory(value);
  }

  update(id: string, patch: Partial<CategorySavePayload>): Observable<CategoryMutationResponse> {
    const body = this.buildUpdateBody(patch);
    return this.http
      .patch<ApiCategoryMutationResponse>(`${this.apiUrl}categories/${id}`, body, { withCredentials: true })
      .pipe(
        map((res) => this.mapMutationResponse(res)),
        tap((res) => {
          if (res.category) {
            this.replaceCategory(res.category);
          }
        }),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  toggleStatus(id: string): Observable<CategoryMutationResponse> {
    const current = this.categoriesSubject.value.find((c) => c.id === id || c._id === id);
    if (!current) {
      return throwError(() => new Error('Category not found'));
    }

    const nextStatus: CategoryStatus = current.status === 'active' ? 'inactive' : 'active';
    return this.updateCategoryStatus(id, nextStatus);
  }

  private mapApiCategory(row: ApiCategory): Category {
    const id = String(row._id ?? '');
    return {
      _id: id,
      id,
      name: String(row.name ?? ''),
      type: (String(row.type ?? 'SHOP').toUpperCase() as CategoryType),
      status: row.isActive === false ? 'inactive' : 'active',
    };
  }

  private mapMutationResponse(res: ApiCategoryMutationResponse): CategoryMutationResponse {
    return {
      message: this.readMessage(res),
      category: res.category ? this.mapApiCategory(res.category) : undefined,
    };
  }

  private buildUpdateBody(patch: Partial<CategorySavePayload>): Partial<{ name: string; type: CategoryType; isActive: boolean }> {
    const body: Partial<{ name: string; type: CategoryType; isActive: boolean }> = {};
    if (typeof patch.name === 'string') body.name = patch.name;
    if (patch.type) body.type = patch.type;
    if (patch.status) body.isActive = patch.status === 'active';
    return body;
  }

  private prependCategory(category: Category) {
    const withoutExisting = this.categoriesSubject.value.filter(
      (c) => c.id !== category.id && c._id !== category._id
    );
    this.categoriesSubject.next([category, ...withoutExisting]);
  }

  private replaceCategory(category: Category) {
    let found = false;
    const next = this.categoriesSubject.value.map((c) => {
      const same = c.id === category.id || c._id === category._id;
      if (!same) return c;
      found = true;
      return category;
    });
    this.categoriesSubject.next(found ? next : [category, ...next]);
  }

  private readMessage(res: ApiCategoryMutationResponse | null | undefined): string | undefined {
    return res?.message || undefined;
  }

  private readErrorMessage(err: unknown): string {
    const e = err as { error?: { error?: string; message?: string; details?: string }; message?: string };
    return e?.error?.error || e?.error?.message || e?.error?.details || e?.message || 'Request failed';
  }
}

interface ApiCategory {
  _id?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
}

interface ApiCategoryMutationResponse {
  message?: string;
  category?: ApiCategory;
  error?: string;
}

export interface CategoryMutationResponse {
  message?: string;
  category?: Category;
}
