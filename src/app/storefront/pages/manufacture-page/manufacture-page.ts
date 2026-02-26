import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  finalize,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap
} from 'rxjs';

import { AuthStateService } from '../../../core/services/auth-state.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ManufactureService } from '../../services/manufacture-service';
import { StorefrontLayoutComponent } from '../storefront-layout.component/storefront-layout.component';
import { StorefrontStateService } from '../../services/store-front-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';

@Component({
  selector: 'app-manufacture-page',
  providers: [StorefrontStateService],
  imports: [
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
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly manufactureService = inject(ManufactureService);
  readonly state = inject(StorefrontStateService);

  readonly currentUser$ = this.authState.currentUser$;
  readonly pageIndex = signal(1);
  readonly pageSize = signal(12);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly shopLoading = signal(false);
  readonly shopError = signal<string | null>(null);
  readonly addingProductId = signal<string | null>(null);
  readonly addedProductId = signal<string | null>(null);

  private readonly shopId$ = this.route.paramMap.pipe(
    map(params => (params.get('shopId') ?? '').trim()),
    distinctUntilChanged(),
    shareReplay(1)
  );

  readonly boutique$ = this.shopId$.pipe(
    switchMap(shopId => {
      if (!shopId) {
        this.shopLoading.set(false);
        this.shopError.set('Select a store from a product card.');
        return of(null);
      }

      this.shopLoading.set(true);
      this.shopError.set(null);

      return this.manufactureService.getBoutiqueById(shopId).pipe(
        tap(boutique => {
          if (!boutique) {
            this.shopError.set('Unable to load store profile right now.');
          }
        }),
        finalize(() => this.shopLoading.set(false))
      );
    }),
    shareReplay(1)
  );

  private readonly searchResult$ = combineLatest([
    this.shopId$,
    toObservable(this.pageIndex),
    toObservable(this.pageSize)
  ]).pipe(
    switchMap(([shopId, pageIndex, pageSize]) => {
      if (!shopId) {
        this.loading.set(false);
        this.error.set('Select a store from a product card.');
        return of({ items: [], total: 0 });
      }

      this.loading.set(true);
      this.error.set(null);

      return this.productService.getProductsByShopId(shopId, pageIndex, pageSize).pipe(
        catchError(error => {
          console.error('Shop products load error', error);
          this.error.set('Unable to load products right now.');
          return of({ items: [], total: 0 });
        }),
        finalize(() => this.loading.set(false))
      );
    }),
    shareReplay(1)
  );

  readonly products$ = this.searchResult$.pipe(map(result => result.items));
  readonly totalItems$ = this.searchResult$.pipe(map(result => result.total));

  onLogout(): void {
    this.authState.logout();
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
