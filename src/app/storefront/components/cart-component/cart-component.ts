import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';

import { CartService, CartItemsState } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { environment } from '../../../../environments/environment';
import { APP_CURRENCY } from '../../../core/constants/app-locale';

type DeliveryOption = { id: string; label: string; fee: number };

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  info?: string;
};

type CartLine = {
  productId: string;
  quantity: number;
  product: Product;
};

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './cart-component.html',
  styleUrls: ['./cart-component.css'],
})
export class CartComponent {
  private router = inject(Router);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  readonly pictureBaseUrl = environment.pictureUrl;

  currencyCode = APP_CURRENCY;

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  deliveryOptions: DeliveryOption[] = [
    { id: 'standard', label: 'Standard delivery (2-4 days)', fee: 4.99 },
    { id: 'express', label: 'Express delivery (24-48h)', fee: 9.99 },
    { id: 'pickup', label: 'Store pickup', fee: 0 },
  ];
  deliveryId = this.deliveryOptions[0].id;

  cartState$ = this.cartService.cartItems$;

  lines$: Observable<CartLine[]> = this.cartState$.pipe(
    map((state: CartItemsState) =>
      Object.entries(state).map(([productId, quantity]) => ({ productId, quantity }))
    ),
    switchMap((entries) => {
      if (entries.length === 0) return of([]);

      return forkJoin(
        entries.map(({ productId, quantity }) =>
          this.loadProduct$(productId).pipe(
            map((product) => ({ productId, quantity, product })),
            catchError((err) => {
              console.error('Unable to load product', productId, err);
              return of({
                productId,
                quantity,
                product: {
                  id: productId,
                  name: 'Unavailable product',
                  price: 0,
                  imageUrl: '',
                } as Product,
              });
            })
          )
        )
      );
    }),
    shareReplay(1)
  );

  trackByProductId = (_: number, line: CartLine) => line.productId;

  increment(productId: string) { this.cartService.increment(productId).subscribe(); }
  decrement(productId: string) { this.cartService.decrement(productId).subscribe(); }
  updateQty(productId: string, q: number) { this.cartService.updateQuantity(productId, q).subscribe(); }
  remove(productId: string) { this.cartService.removeItem(productId).subscribe(); }

  subtotal(lines: CartLine[]): number {
    return lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  }

  selectedDelivery(): DeliveryOption {
    return this.deliveryOptions.find(o => o.id === this.deliveryId) ?? this.deliveryOptions[0];
  }

  deliveryFee(): number {
    return this.selectedDelivery().fee;
  }

  total(lines: CartLine[]): number {
    return this.subtotal(lines) + this.deliveryFee();
  }

  checkout(lines: CartLine[]) {
    console.log('Checkout', {
      items: lines.map(l => ({ productId: l.productId, quantity: l.quantity })),
      delivery: this.selectedDelivery(),
      subtotal: this.subtotal(lines),
      total: this.total(lines),
    });
  }

  private loadProduct$(id: string): Observable<Product> {
    const ps: any = this.productService;

    const obs: Observable<any> =
      ps.getProductById?.(id) ??
      ps.getProduct?.(id);

    if (!obs) {
      throw new Error('ProductService must expose getProductById(id) or getProduct(id).');
    }

    return obs.pipe(
      take(1),
      map((p: any) => ({
        id: p.id ?? id,
        name: p.name ?? p.title ?? 'Product',
        price: Number(p.price ?? 0),
        imageUrl: p.imageUrl ?? p.image ?? p.thumbnailUrl ?? '',
        info: p.info ?? p.shortDescription ?? p.brand ?? '',
      }))
    );
  }
}
