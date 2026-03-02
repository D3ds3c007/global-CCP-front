import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { CartItemsState, CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { APP_CURRENCY } from '../../../core/constants/app-locale';

type PaymentMethod = 'COD' | 'MOBILE_MONEY';

type DeliveryOption = { id: string; label: string; fee: number };

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  info?: string;
  shopId?: string;
};

type CheckoutLine = {
  productId: string;
  quantity: number;
  product: Product;
  shopId: string;
};

export type CheckoutPayload = {
  buyer: {
    phone: string;
    address: string;
    paymentMethod: string;
  };
  items: Array<{ productId: string; shopId: string; qty: number }>;
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './checkout-component.html',
  styleUrls: ['./checkout-component.css'],
})
export class CheckoutComponent {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  @Output() confirmed = new EventEmitter<CheckoutPayload>();

  currencyCode = APP_CURRENCY;
  submitting = false;

  deliveryOptions: DeliveryOption[] = [
    { id: 'standard', label: 'Standard delivery (2-4 days)', fee: 4.99 },
    { id: 'express', label: 'Express delivery (24-48h)', fee: 9.99 },
    { id: 'pickup', label: 'Store pickup', fee: 0 },
  ];

  form = this.fb.group({
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    deliveryId: [this.deliveryOptions[0].id, [Validators.required]],
    provider: ['', [Validators.required]],
  });

  cartState$ = this.cartService.cartItems$;

  lines$: Observable<CheckoutLine[]> = this.cartState$.pipe(
    map((state: CartItemsState) =>
      Object.entries(state).map(([productId, quantity]) => ({ productId, quantity }))
    ),
    switchMap((entries) => {
      if (entries.length === 0) return of([]);

      return forkJoin(
        entries.map(({ productId, quantity }) =>
          this.loadProduct$(productId).pipe(
            take(1),
            map((product) => ({ productId, quantity, product, shopId: product.shopId ?? '' })),
            catchError((err) => {
              console.error('Unable to load product', productId, err);
              return of({
                productId,
                quantity,
                product: { id: productId, name: 'Unavailable product', price: 0, imageUrl: '', shopId: '' },
                shopId: ''
              } as CheckoutLine);
            })
          )
        )
      );
    }),
    shareReplay(1)
  );

  trackByProductId = (_: number, line: CheckoutLine) => line.productId;

  subtotal(lines: CheckoutLine[]): number {
    return lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  }

  selectedDelivery(): DeliveryOption {
    const id = this.form.value.deliveryId!;
    return this.deliveryOptions.find(o => o.id === id) ?? this.deliveryOptions[0];
  }

  deliveryFee(): number {
    return this.selectedDelivery().fee;
  }

  total(lines: CheckoutLine[]): number {
    return this.subtotal(lines);
  }

  confirm(lines: CheckoutLine[]) {
    console.log('Confirming order with lines:', lines);
    if (lines.length === 0) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const missing = lines.filter(l => !l.shopId);
    if (missing.length) {
      console.error('Cannot create order: missing shopId for some items', missing);
      this.form.setErrors?.({ missingShopId: true });
      return;
    }

    const v = this.form.getRawValue();
    const payload: CheckoutPayload = {
      buyer: {
        phone: v.phone!,
        address: v.address!,
        paymentMethod: v.provider!
      },
      items: lines.map(l => ({
        productId: l.productId,
        qty: l.quantity,
        shopId: l.shopId,
      })),
    };

    console.log('Prepared payload:', payload);

    this.orderService.submitOrder(payload).subscribe({
      next: (res) => {
        console.log('Order submitted successfully', res);
        this.submitting = false;
        this.confirmed.emit(payload);
      },
      error: (err) => {
        console.error('Error submitting order', err);
        this.submitting = false;
      }
    });

    this.submitting = true;
    window.location.href = '/orders';
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
      map((p: any) => ({
        id: p.id ?? id,
        name: p.name ?? p.title ?? 'Product',
        price: Number(p.price ?? 0),
        imageUrl: p.imageUrl ?? p.image ?? p.thumbnailUrl ?? '',
        info: p.info ?? p.shortDescription ?? p.brand ?? '',
        shopId: p.shopId ?? p.shop?._id ?? p.storeId ?? '',
      }))
    );
  }
}
