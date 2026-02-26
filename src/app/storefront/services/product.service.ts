import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  storeName: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  categoryName?: string;
  images?: string[];
  description?: string;
  shopId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
}

export type SortOption = 'PRICE_ASC' | 'PRICE_DESC';

export interface SearchQuery {
  keyword: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: string[];
  sort: SortOption;
}

export const BACKEND_PRODUCT_PAGE_SIZE = 10;

export const createDefaultSearchQuery = (): SearchQuery => ({
  keyword: '',
  minPrice: null,
  maxPrice: null,
  categoryIds: [],
  sort: 'PRICE_ASC'
});

interface BackendProduct {
  _id: string;
  shopId?: string | { _id?: string; name?: string };
  categoryId?: string | { _id?: string; name?: string };
  name: string;
  price: number;
  stock?: number;
  images?: string[];
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendProductListResponse {
  products: BackendProduct[];
  totalPages: number;
}

interface BackendTopProduct {
  productId: string | { _id?: string };
  name: string;
  price: number;
  stock?: number;
  // shopId?: string | { _id?: string; name?: string };
  shop?: any | { _id?: string; name?: string };
  images?: string[];
  totalSold: number;
  totalRevenue: number;
}

interface BackendCategory {
  _id: string;
  name: string;
  type?: string;
  isACTIVE?: boolean;
}

interface BackendCategoryListResponse {
  categories: BackendCategory[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly productsUrl = `${environment.apiUrl}products`;
  private readonly categoriesUrl = `${environment.apiUrl}categories`;
  private readonly fallbackImageUrl = 'https://via.placeholder.com/320x220?text=Product';

  handleAddToCart(e: { productId: string; quantity: number }): void {
    console.log('ADD TO CART', e);
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.http
      .get<BackendProduct>(`${this.productsUrl}/${id}`, { withCredentials: true })
      .pipe(
        map(product => this.mapBackendProduct(product)),
        catchError(error => {
          console.error('getProductById failed', error);
          return of(undefined);
        })
      );
  }

  getCategories(): Observable<Category[]> {
    const params = new HttpParams().set('type', 'PRODUCT');

    return this.http
      .get<BackendCategoryListResponse>(this.categoriesUrl, {
        params,
        withCredentials: true
      })
      .pipe(
        map(response =>
          (response.categories ?? [])
            .filter(category => category.isACTIVE !== false)
            .map(category => ({
              id: category._id,
              name: category.name
            }))
        ),
        catchError(error => {
          console.error('getCategories failed', error);
          return of([]);
        })
      );
  }

  getTopProducts(): Observable<Product[]> {
    return this.http
      .get<BackendTopProduct[]>(`${this.productsUrl}/top`, { withCredentials: true })
      .pipe(
        map(rows => (rows ?? []).map(row => this.mapTopProduct(row))),
        catchError(error => {
          console.warn('Top products endpoint failed, falling back to first page of products', error);
          return this.fetchProductPage(createDefaultSearchQuery(), 1).pipe(
            map(response => (response.products ?? []).slice(0, 5).map(product => this.mapBackendProduct(product))),
            catchError(fallbackError => {
              console.error('Top products fallback failed', fallbackError);
              return of([]);
            })
          );
        })
      );
  }

  searchProducts(
    query: SearchQuery,
    pageIndex: number,
    pageSize: number
  ): Observable<{ items: Product[]; total: number }> {
    const safePage = Math.max(1, pageIndex);

    return this.fetchProductPage(query, safePage).pipe(
      map(response => {
        const items = (response.products ?? []).map(product => this.mapBackendProduct(product));
        const totalPages = Math.max(0, Number(response.totalPages) || 0);
        const total = totalPages * BACKEND_PRODUCT_PAGE_SIZE;

        if (pageSize !== BACKEND_PRODUCT_PAGE_SIZE) {
          console.warn(
            `Backend products endpoint uses fixed page size ${BACKEND_PRODUCT_PAGE_SIZE}; received pageSize=${pageSize}`
          );
        }

        return { items, total };
      })
    );
  }

  getProductsByShopId(
    shopId: string,
    pageIndex: number,
    pageSize: number
  ): Observable<{ items: Product[]; total: number }> {
    const safePage = Math.max(1, pageIndex);

    return this.fetchProductPage(createDefaultSearchQuery(), safePage, shopId).pipe(
      map(response => {
        const items = (response.products ?? []).map(product => this.mapBackendProduct(product));
        const totalPages = Math.max(0, Number(response.totalPages) || 0);
        const total = totalPages * BACKEND_PRODUCT_PAGE_SIZE;

        if (pageSize !== BACKEND_PRODUCT_PAGE_SIZE) {
          console.warn(
            `Backend products endpoint uses fixed page size ${BACKEND_PRODUCT_PAGE_SIZE}; received pageSize=${pageSize}`
          );
        }

        return { items, total };
      })
    );
  }

  private fetchProductPage(
    query: SearchQuery,
    pageIndex: number,
    shopId?: string
  ): Observable<BackendProductListResponse> {
    let params = new HttpParams().set('page', String(Math.max(1, pageIndex)));

    const keyword = query.keyword.trim();
    if (keyword) {
      params = params.set('q', keyword);
    }

    if (query.minPrice !== null) {
      params = params.set('min', String(query.minPrice));
    }

    if (query.maxPrice !== null) {
      params = params.set('max', String(query.maxPrice));
    }

    if (query.categoryIds.length > 0) {
      params = params.set('categoryId', query.categoryIds[0]);
    }

    if (shopId?.trim()) {
      params = params.set('shopId', shopId.trim());
    }

    params = params.set('sort', this.mapSort(query.sort));

    return this.http.get<BackendProductListResponse>(this.productsUrl, {
      params,
      withCredentials: true
    });
  }

  private mapSort(sort: SortOption): 'price_asc' | 'price_desc' {
    return sort === 'PRICE_DESC' ? 'price_desc' : 'price_asc';
  }

  private mapBackendProduct(raw: BackendProduct): Product {
    const images = Array.isArray(raw.images) ? raw.images.filter(Boolean) : [];
    const imageUrl = images[0] || this.fallbackImageUrl;

    return {
      id: raw._id,
      name: raw.name,
      storeName: this.extractShopName(raw.shopId),
      price: Number(raw.price ?? 0),
      stock: Number(raw.stock ?? 0),
      imageUrl,
      categoryId: this.extractId(raw.categoryId),
      categoryName: this.extractCategoryName(raw.categoryId),
      images,
      description: raw.description ?? '',
      shopId: this.extractId(raw.shopId),
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    };
  }

  private mapTopProduct(raw: BackendTopProduct): Product {
    const images = Array.isArray(raw.images) ? raw.images.filter(Boolean) : [];
    const imageUrl = images[0] || this.fallbackImageUrl;

    return {
      id: this.extractId(raw.productId),
      name: raw.name,
      storeName: raw.shop?.name ?? 'Unknown Shop',
      price: Number(raw.price ?? 0),
      stock: Number(raw.stock ?? 0),
      imageUrl,
      categoryId: '',
      images
    };
  }

  private extractCategoryName(value: unknown): string {
    if (value && typeof value === 'object' && 'name' in value) {
      const maybeName = (value as { name?: unknown }).name;
      if (typeof maybeName === 'string' && maybeName.trim()) {
        return maybeName;
      }
    }

    return 'Uncategorized';
  }

  private extractId(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    if (value && typeof value === 'object' && '_id' in value) {
      const maybeId = (value as { _id?: unknown })._id;
      return typeof maybeId === 'string' ? maybeId : '';
    }

    return '';
  }

  private extractShopName(value: unknown): string {
    if (value && typeof value === 'object' && 'name' in value) {
      const maybeName = (value as { name?: unknown }).name;
      if (typeof maybeName === 'string' && maybeName.trim()) {
        return maybeName;
      }
    }

    return 'Verified shop';
  }
}
