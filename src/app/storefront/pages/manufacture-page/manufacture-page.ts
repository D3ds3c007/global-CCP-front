import { Component, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { createDefaultSearchQuery, ProductService, SearchQuery } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { catchError, combineLatest, finalize, map, of, shareReplay, startWith, switchMap, take, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { StorefrontLayoutComponent } from "../storefront-layout.component/storefront-layout.component";
import { StorefrontStateService  } from '../../services/store-front-state';
import { HeaderManufacture } from '../../components/header-manufacture/header-manufacture';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { AsyncPipe } from '@angular/common';




@Component({
  selector: 'app-manufacture-page',
  providers: [StorefrontStateService ],
  imports: [
    HeaderManufacture,
    StorefrontLayoutComponent,
    AsyncPipe,
    ProductGridComponent,
    PaginationComponent,
],
  templateUrl: './manufacture-page.html',
  styleUrl: './manufacture-page.css',
})
export class ManufacturePage {
  private readonly authState = inject(AuthStateService);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  readonly state = inject(StorefrontStateService );

  readonly currentUser$ = this.authState.currentUser$;

  readonly query = signal<SearchQuery>(createDefaultSearchQuery());
  readonly pageIndex = signal(1);
  readonly pageSize = signal(12);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly addingProductId = signal<string | null>(null);
  readonly addedProductId = signal<string | null>(null);

  readonly categories$ = this.productService.getCategories().pipe(shareReplay(1));
  readonly topProducts$ = this.productService.getTopProducts().pipe(shareReplay(1));

  private readonly searchResult$ = combineLatest([
    toObservable(this.query),
    toObservable(this.pageIndex),
    toObservable(this.pageSize)
  ]).pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set(null);
    }),
    switchMap(([query, pageIndex, pageSize]) =>
      this.productService.searchProducts(query, pageIndex, pageSize).pipe(
        catchError(error => {
          console.error('Search error', error);
          this.error.set('Unable to load products right now.');
          return of({ items: [], total: 0 });
        })
      )
    ),
    tap(() => this.loading.set(false)),
    startWith({ items: [], total: 0 })
  );

  readonly products$ = this.searchResult$.pipe(map(result => result.items));
  readonly totalItems$ = this.searchResult$.pipe(map(result => result.total));

  onLogout(): void {
    this.authState.logout();
  }

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
        }
      });
  }
}
