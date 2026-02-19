import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, finalize, map, of, shareReplay, startWith, switchMap, take, tap } from 'rxjs';

import { AuthStateService } from '../../../core/services/auth-state.service';
import {
  ProductService,
  SearchQuery,
  createDefaultSearchQuery
} from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AdvancedSearchPanelComponent } from '../../components/advanced-search/advanced-search-panel.component';
import { CenterBar } from '../../components/center-bar/center-bar';
import { StorefrontStateService  } from '../../services/store-front-state';

@Component({
  selector: 'app-storefront-layout',
  providers: [StorefrontStateService ],
  imports: [
    AsyncPipe,
    NavbarComponent,
    AdvancedSearchPanelComponent,
    CenterBar
],
  templateUrl: './storefront-layout.component.html',
  styleUrl: './storefront-layout.component.css',
})
export class StorefrontLayoutComponent {
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
