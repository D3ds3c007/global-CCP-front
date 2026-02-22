import { Injectable, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';

import {
  BACKEND_PRODUCT_PAGE_SIZE,
  ProductService,
  SearchQuery,
  createDefaultSearchQuery,
} from '../services/product.service';
import { CartService } from '../services/cart.service';

@Injectable() // <-- IMPORTANT: pas providedIn:'root' (on scope par route)
export class StorefrontStateService {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly query = signal<SearchQuery>(createDefaultSearchQuery());
  readonly pageIndex = signal(1);
  readonly pageSize = signal(BACKEND_PRODUCT_PAGE_SIZE);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly addingProductId = signal<string | null>(null);
  readonly addedProductId = signal<string | null>(null);

  readonly categories$ = this.productService.getCategories().pipe(shareReplay(1));
  readonly topProducts$ = this.productService.getTopProducts().pipe(shareReplay(1));

  private readonly searchResult$ = combineLatest([
    toObservable(this.query),
    toObservable(this.pageIndex),
    toObservable(this.pageSize),
  ]).pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(([query, pageIndex, pageSize]) =>
      this.productService.searchProducts(query, pageIndex, pageSize).pipe(
        catchError((err) => {
          console.error('Search error', err);
          this.error.set('Unable to load products right now.');
          return of({ items: [], total: 0 });
        })
      )
    ),
    tap(() => this.loading.set(false)),
    startWith({ items: [], total: 0 })
  );

  readonly products$ = this.searchResult$.pipe(map((r) => r.items));
  readonly totalItems$ = this.searchResult$.pipe(map((r) => r.total));

  onQueryChange(query: SearchQuery): void {
    this.query.set({ ...query, categoryIds: [...query.categoryIds] });
    this.pageIndex.set(1);
  }

  onClearFilters(): void {
    this.query.set(createDefaultSearchQuery());
    this.pageIndex.set(1);
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
  }

  onAddToCart(productId: string): void {
    this.addingProductId.set(productId);

    this.cartService
      .addItem(productId, 1)
      .pipe(
        take(1),
        finalize(() => this.addingProductId.set(null))
      )
      .subscribe({
        next: () => {
          this.addedProductId.set(productId);
          setTimeout(() => this.addedProductId.set(null), 1200);
        },
      });
  }
}
