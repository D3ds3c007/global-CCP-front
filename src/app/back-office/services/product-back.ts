import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
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
  description: string;
}

export interface ProductUpsertPayload {
  name: string;
  categoryId: string;
  status: ProductStatus;
  price: number;
  stock: number;
  description: string;
}

export interface ProductDialogSubmit {
  mode: 'create' | 'edit';
  id?: string;
  payload: ProductUpsertPayload;
  files: File[];
  retainedImages: string[];
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
  private readonly apiOrigin = this.readApiOrigin(this.apiUrl);

  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
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

  loadProductCategories(): Observable<Category[]> {
    const params = new HttpParams().set('type', 'PRODUCT');
    return this.http
      .get<ApiCategory[]>(`${this.apiUrl}categories`, { params, withCredentials: true })
      .pipe(
        map((rows) =>
          (rows ?? []).map((c) => ({
            id: String(c._id ?? ''),
            name: String(c.name ?? ''),
          }))
        ),
        tap((categories) => this.categoriesSubject.next(categories)),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  loadProducts(shopId: string): Observable<Product[]> {
    const statuses = ['ACTIVE', 'DISABLED', 'OUT_OF_STOCK'] as const;

    return forkJoin(statuses.map((status) => this.fetchProductsByStatus(shopId, status))).pipe(
      map((groups) => groups.flat()),
      map((products) => this.dedupeProducts(products)),
      tap((products) => {
        this.productsSubject.next(products);
        if (!this.categoriesSubject.value.length) {
          this.categoriesSubject.next(this.buildCategories(products));
        }
      }),
      catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
    );
  }

  getProduct(productId: string): Observable<Product> {
    return this.http
      .get<ApiProduct>(`${this.apiUrl}products/${productId}`, { withCredentials: true })
      .pipe(
        map((res) => this.mapApiProduct(res)),
        tap((p) => this.upsertLocal(p)),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  createProduct(shopId: string, payload: ProductUpsertPayload, files: File[]): Observable<Product> {
    const body = this.buildProductFormData(shopId, payload, files, []);
    return this.http
      .post<{ message?: string; product?: ApiProduct }>(`${this.apiUrl}products`, body, { withCredentials: true })
      .pipe(
        map((res) => this.mapApiProduct(res.product ?? {})),
        tap((product) => this.prependProduct(product)),
        catchError((err) => throwError(() => new Error(this.readErrorMessage(err))))
      );
  }

  updateProduct(
    productId: string,
    shopId: string,
    payload: ProductUpsertPayload,
    files: File[],
    retainedImages: string[]
  ): Observable<Product> {
    const body = this.buildProductFormData(shopId, payload, files, retainedImages);
    return this.http
      .put<{ message?: string; product?: ApiProduct } | ApiProduct>(
        `${this.apiUrl}products/${productId}`,
        body,
        { withCredentials: true }
      )
      .pipe(
        map((res) => this.mapApiProduct((res as { product?: ApiProduct }).product ?? (res as ApiProduct))),
        tap((updated) => this.replaceProduct(updated)),
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
        map((res) => this.mapApiProduct((res as { product?: ApiProduct }).product ?? (res as ApiProduct))),
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

  create(product: ProductUpsertPayload & { imageUrl?: string }) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `p-${Date.now()}`;
    const image = product.imageUrl ?? '';
    this.prependProduct({
      _id: id,
      id,
      imageUrl: image,
      images: image ? [image] : [],
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      categoryName: product.categoryId,
      status: product.status,
      backendStatus: product.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED',
      description: '',
    });
  }

  update(productId: string, patch: Partial<Product>) {
    const next = this.productsSubject.value.map((p) =>
      p.id === productId || p._id === productId ? ({ ...p, ...patch } as Product) : p
    );
    this.productsSubject.next(next);
  }

  delete(productId: string) {
    this.deleteLocal(productId);
  }

  private fetchProductsByStatus(
    shopId: string,
    status: 'ACTIVE' | 'DISABLED' | 'OUT_OF_STOCK'
  ): Observable<Product[]> {
    return this.fetchProductsPage(shopId, status, 1).pipe(
      switchMap((firstPage) => {
        const totalPages = Math.max(Number(firstPage.totalPages ?? 1), 1);
        if (totalPages <= 1) return of([firstPage]);
        const rest = Array.from({ length: totalPages - 1 }, (_, i) =>
          this.fetchProductsPage(shopId, status, i + 2)
        );
        return forkJoin([of(firstPage), ...rest]);
      }),
      map((pages) => pages.flatMap((page) => (page.products ?? []).map((p) => this.mapApiProduct(p))))
    );
  }

  private fetchProductsPage(
    shopId: string,
    status: 'ACTIVE' | 'DISABLED' | 'OUT_OF_STOCK',
    page: number
  ): Observable<ApiProductsResponse> {
    const params = new HttpParams().set('shopId', shopId).set('status', status).set('page', String(page));
    return this.http.get<ApiProductsResponse>(`${this.apiUrl}products`, { params, withCredentials: true });
  }

  private buildProductFormData(
    shopId: string,
    payload: ProductUpsertPayload,
    files: File[],
    retainedImages: string[]
  ): FormData {
    const fd = new FormData();
    fd.append('shopId', shopId);
    fd.append('name', payload.name.trim());
    fd.append('categoryId', payload.categoryId);
    fd.append('status', payload.status === 'ACTIVE' ? 'ACTIVE' : 'DISABLED');
    fd.append('price', String(payload.price));
    fd.append('stock', String(payload.stock));
    fd.append('description', payload.description ?? '');
    fd.append('retainedImagesJson', JSON.stringify(retainedImages ?? []));
    for (const file of files) fd.append('images', file);
    return fd;
  }

  private mapApiProduct(api: ApiProduct): Product {
    const id = String(api?._id ?? '');
    const rawStatus = String(api?.status ?? '').toUpperCase();
    const rawImages = Array.isArray(api?.images) ? api.images : [];
    const images = rawImages
      .filter((img): img is string => typeof img === 'string' && img.length > 0)
      .map((img) => img.trim());
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
      description: String(api?.description ?? ''),
    };
  }

  private normalizeImageUrl(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `${this.apiOrigin}${url}`;
    return `${this.apiOrigin}/${url}`;
  }

  private readApiOrigin(apiUrl: string): string {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return '';
    }
  }

  private prependProduct(product: Product): void {
    this.productsSubject.next([product, ...this.productsSubject.value.filter((p) => p._id !== product._id)]);
    this.categoriesSubject.next(this.mergeCategoriesWithProduct(product));
  }

  private replaceProduct(updated: Product): void {
    const next = this.productsSubject.value.map((p) => (p._id === updated._id ? updated : p));
    this.productsSubject.next(next);
    this.categoriesSubject.next(this.mergeCategoriesWithProduct(updated));
  }

  private upsertLocal(product: Product): void {
    const existing = this.productsSubject.value.some((p) => p._id === product._id);
    if (existing) this.replaceProduct(product);
    else this.prependProduct(product);
  }

  private deleteLocal(productId: string): void {
    this.productsSubject.next(
      this.productsSubject.value.filter((p) => p._id !== productId && p.id !== productId)
    );
  }

  private dedupeProducts(products: Product[]): Product[] {
    const mapById = new Map<string, Product>();
    for (const p of products) mapById.set(p._id, p);
    return [...mapById.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private buildCategories(products: Product[]): Category[] {
    const mapById = new Map<string, Category>();
    for (const p of products) {
      if (!p.categoryId) continue;
      if (!mapById.has(p.categoryId)) {
        mapById.set(p.categoryId, { id: p.categoryId, name: p.categoryName || p.categoryId });
      }
    }
    return [...mapById.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private mergeCategoriesWithProduct(product: Product): Category[] {
    const current = this.categoriesSubject.value;
    if (!product.categoryId) return current;
    if (current.some((c) => c.id === product.categoryId)) return current;
    return [...current, { id: product.categoryId, name: product.categoryName || product.categoryId }].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  private readErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const e = err as { error?: { message?: string; error?: string }; message?: string };
      return e.error?.message || e.error?.error || e.message || 'Products request failed';
    }
    return 'Products request failed';
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
  categoryId?: string | ApiProductCategoryRef;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[];
  status?: string;
}

interface ApiCategory {
  _id?: string;
  name?: string;
}
