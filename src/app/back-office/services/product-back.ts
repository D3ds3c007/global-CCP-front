import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, forkJoin, map, of, switchMap, tap, throwError, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  _id: string;
  id: string;
  imageUrl: string;
  images: string[];
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  status: ProductStatus;
  backendStatus: string;
  description?: string;
}

export interface ProductDraft {
  imageUrl: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  status: ProductStatus;
}

export interface ProductsQuery {
  search: string;
  categoryId: string | 'all';
  status: ProductStatus | 'all';
}

export interface ProductsKpis {
  processedOrdersPercent: number;
  PENDINGOrdersPercent: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsBackService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly categoriesSubject = new BehaviorSubject<Category[]>([
    { id: 'cat-it', name: 'IT' },
    { id: 'cat-construction', name: 'Construction' },
    { id: 'cat-logistics', name: 'Logistics' },
  ]);

  private readonly productsSubject = new BehaviorSubject<Product[]>([]);

  private readonly querySubject = new BehaviorSubject<ProductsQuery>({
    search: '',
    categoryId: 'all',
    status: 'all',
  });

  private readonly kpisSubject = new BehaviorSubject<ProductsKpis>({
    processedOrdersPercent: 15,
    PENDINGOrdersPercent: 4,
  });

  readonly categories$ = this.categoriesSubject.asObservable();
  readonly kpis$ = this.kpisSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();

  readonly productsFiltered$ = combineLatest([this.productsSubject, this.querySubject]).pipe(
    map(([products, q]) => {
      const s = q.search.trim().toLowerCase();

      return products.filter((p) => {
        const matchSearch = !s || p.name.toLowerCase().includes(s);
        const matchCategory = q.categoryId === 'all' || p.categoryId === q.categoryId;
        const matchStatus = q.status === 'all' || p.status === q.status;

        return matchSearch && matchCategory && matchStatus;
      });
    })
  );

  readonly vm$ = combineLatest({
    kpis: this.kpis$,
    categories: this.categories$,
    query: this.query$,
    products: this.productsFiltered$,
  });

  setQuery(patch: Partial<ProductsQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  loadProducts(shopId: string): Observable<Product[]> {
    const statuses = ['ACTIVE', 'DISABLED', 'OUT_OF_STOCK'] as const;

    return forkJoin(statuses.map((status) => this.fetchProductsByStatus(shopId, status))).pipe(
      map((groups) => groups.flat()),
      map((products) => this.dedupeProducts(products)),
      tap((products) => {
        this.productsSubject.next(products);
        this.categoriesSubject.next(this.buildCategories(products));
      }),
      catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
    );
  }

  toggleStatus(productId: string, nextStatus: ProductStatus, _shopId?: string): Observable<Product> {
    const statusForApi = nextStatus === 'ACTIVE' ? 'ACTIVE' : 'DISABLED';

    return this.http
      .put<{ message?: string; product?: ApiProduct } | ApiProduct>(
        `${this.apiUrl}products/${productId}`,
        { status: statusForApi },
        { withCredentials: true }
      )
      .pipe(
        map((res) => this.mapApiProduct((res as { product?: ApiProduct })?.product ?? (res as ApiProduct))),
        tap((updated) => this.replaceProduct(updated)),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  deleteProduct(productId: string, _shopId?: string): Observable<void> {
    return this.http
      .delete<{ message?: string }>(`${this.apiUrl}products/${productId}`, { withCredentials: true })
      .pipe(
        tap(() => this.deleteLocal(productId)),
        map(() => void 0),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  toggleACTIVE(productId: string) {
    const next: Product[] = this.productsSubject.value.map((p) =>
      p.id === productId
        ? { ...p, status: (p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') as ProductStatus, backendStatus: p.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }
        : p
    );

    this.productsSubject.next(next);
  }

  create(product: ProductDraft) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'p-' + Date.now();

    const next: Product[] = [
      {
        ...product,
        _id: id,
        id,
        images: product.imageUrl ? [product.imageUrl] : [],
        categoryName: product.categoryId,
        backendStatus: product.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED',
        description: '',
      },
      ...this.productsSubject.value,
    ];
    this.productsSubject.next(next);
  }

  delete(productId: string) {
    this.deleteLocal(productId);
  }

  update(productId: string, patch: Partial<Product>) {
    const next: Product[] = this.productsSubject.value.map((p) =>
      p.id === productId ? ({ ...p, ...patch } as Product) : p
    );
    this.productsSubject.next(next);
  }

  private fetchProductsByStatus(
    shopId: string,
    status: 'ACTIVE' | 'DISABLED' | 'OUT_OF_STOCK'
  ): Observable<Product[]> {
    return this.fetchProductsPage(shopId, status, 1).pipe(
      switchMap((firstPage) => {
        const totalPages = Math.max(Number(firstPage.totalPages ?? 1), 1);
        if (totalPages <= 1) {
          return of([firstPage]);
        }

        const otherPages = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.fetchProductsPage(shopId, status, i + 2)
        );

        return forkJoin([of(firstPage), ...otherPages]);
      }),
      map((pages) => pages.flatMap((page) => (page.products ?? []).map((p) => this.mapApiProduct(p))))
    );
  }

  private fetchProductsPage(
    shopId: string,
    status: 'ACTIVE' | 'DISABLED' | 'OUT_OF_STOCK',
    page: number
  ): Observable<ApiProductsResponse> {
    const params = new HttpParams()
      .set('shopId', shopId)
      .set('status', status)
      .set('page', String(page));

    return this.http.get<ApiProductsResponse>(`${this.apiUrl}products`, {
      params,
      withCredentials: true,
    });
  }

  private mapApiProduct(api: ApiProduct): Product {
    const id = String(api?._id ?? '');
    const rawStatus = String(api?.status ?? '').toUpperCase();
    const images = Array.isArray(api?.images) ? api.images.filter((img): img is string => typeof img === 'string') : [];
    const categoryIdValue =
      typeof api?.categoryId === 'object' && api.categoryId !== null ? api.categoryId._id : api?.categoryId;
    const categoryName =
      typeof api?.categoryId === 'object' && api.categoryId !== null ? api.categoryId.name : undefined;

    return {
      _id: id,
      id,
      imageUrl: images[0] ?? `https://picsum.photos/seed/${encodeURIComponent(id || 'product')}/600/380`,
      images,
      name: String(api?.name ?? ''),
      price: Number(api?.price ?? 0),
      stock: Number(api?.stock ?? 0),
      categoryId: String(categoryIdValue ?? ''),
      categoryName: categoryName ? String(categoryName) : undefined,
      status: rawStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
      backendStatus: rawStatus || 'DISABLED',
      description: typeof api?.description === 'string' ? api.description : '',
    };
  }

  private replaceProduct(updated: Product): void {
    const next = this.productsSubject.value.map((p) => (p._id === updated._id ? updated : p));
    this.productsSubject.next(next);
    this.categoriesSubject.next(this.buildCategories(next));
  }

  private deleteLocal(productId: string): void {
    const next: Product[] = this.productsSubject.value.filter(
      (p) => p.id !== productId && p._id !== productId
    );
    this.productsSubject.next(next);
    this.categoriesSubject.next(this.buildCategories(next));
  }

  private dedupeProducts(products: Product[]): Product[] {
    const byId = new Map<string, Product>();
    for (const product of products) {
      byId.set(product._id, product);
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private buildCategories(products: Product[]): Category[] {
    const byId = new Map<string, Category>();

    for (const p of products) {
      if (!p.categoryId) continue;
      if (!byId.has(p.categoryId)) {
        byId.set(p.categoryId, {
          id: p.categoryId,
          name: p.categoryName || p.categoryId,
        });
      }
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private readErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const e = err as { error?: { message?: string; error?: string }; message?: string };
      return e.error?.message || e.error?.error || e.message || 'Products request failed';
    }
    return 'Products request failed';
  }

  private seedProducts(): Product[] {
    const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/380`;

    const data: Product[] = [
      { _id: 'p1', id: 'p1', imageUrl: img('pc'), images: [img('pc')], name: 'Gaming Computer', price: 0, stock: 12, categoryId: 'cat-it', categoryName: 'IT', status: 'ACTIVE', backendStatus: 'ACTIVE' },
      { _id: 'p2', id: 'p2', imageUrl: img('scaffold'), images: [img('scaffold')], name: 'Scaffold Service', price: 0, stock: 3, categoryId: 'cat-construction', categoryName: 'Construction', status: 'ACTIVE', backendStatus: 'ACTIVE' },
      { _id: 'p3', id: 'p3', imageUrl: img('container'), images: [img('container')], name: 'Container Transport', price: 0, stock: 0, categoryId: 'cat-logistics', categoryName: 'Logistics', status: 'INACTIVE', backendStatus: 'DISABLED' },
      { _id: 'p4', id: 'p4', imageUrl: img('keyboard'), images: [img('keyboard')], name: 'Keyboard', price: 49, stock: 5, categoryId: 'cat-it', categoryName: 'IT', status: 'ACTIVE', backendStatus: 'ACTIVE' },
      { _id: 'p5', id: 'p5', imageUrl: img('mouse'), images: [img('mouse')], name: 'Mouse', price: 19, stock: 2, categoryId: 'cat-it', categoryName: 'IT', status: 'ACTIVE', backendStatus: 'ACTIVE' },
    ];

    return data;
  }
}

interface ApiProductsResponse {
  products?: ApiProduct[];
  totalPages?: number;
}

interface ApiProductCategoryRef {
  _id?: string;
  name?: string;
}

interface ApiProduct {
  _id?: string;
  shopId?: string | { _id?: string; name?: string; status?: string };
  categoryId?: string | ApiProductCategoryRef;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[];
  status?: string;
}
