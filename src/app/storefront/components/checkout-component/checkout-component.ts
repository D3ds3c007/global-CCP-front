import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';

import { CartItemsState, CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order';

type PaymentMethod = 'COD' | 'MOBILE_MONEY';

type DeliveryOption = { id: string; label: string; fee: number };

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  info?: string;
};

type CheckoutLine = {
  productId: string;
  quantity: number;
  product: Product;
};

export type CheckoutPayload = {
  delivery: {
    fullName: string;
    phone: string;
    address: string;
    note?: string;
  };
  payment: {
    method: PaymentMethod;
    // mock mobile money
    provider?: string;
    mmNumber?: string;
  };
  deliveryOption: DeliveryOption;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  total: number;
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

  currencyCode = 'EUR';
  submitting = false;

  deliveryOptions: DeliveryOption[] = [
    { id: 'standard', label: 'Livraison standard (2–4 jours)', fee: 4.99 },
    { id: 'express', label: 'Livraison express (24–48h)', fee: 9.99 },
    { id: 'pickup', label: 'Retrait en magasin', fee: 0 },
  ];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    note: [''],

    deliveryId: [this.deliveryOptions[0].id, [Validators.required]],

    paymentMethod: ['COD' as PaymentMethod, [Validators.required]],
    // mobile money mock (optionnel)
    provider: ['MTN'],
    mmNumber: [''],
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
            map((product) => ({ productId, quantity, product })),
            catchError((err) => {
              console.error('Unable to load product', productId, err);
              return of({
                productId,
                quantity,
                product: { id: productId, name: 'Produit indisponible', price: 0, imageUrl: '' },
              } as CheckoutLine);
            })
          )
        )
      );
    }),
    shareReplay(1)
  );

  trackByProductId = (_: number, line: CheckoutLine) => line.productId;

  // ----- Totaux -----
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
    return this.subtotal(lines) + this.deliveryFee();
  }

  // ----- Confirm -----
  confirm(lines: CheckoutLine[]) {
    if (lines.length === 0) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: CheckoutPayload = {
      delivery: {
        fullName: v.fullName!,
        phone: v.phone!,
        address: v.address!,
        note: v.note ?? '',
      },
      payment: {
        method: v.paymentMethod!,
        provider: v.paymentMethod === 'MOBILE_MONEY' ? (v.provider ?? '') : undefined,
        mmNumber: v.paymentMethod === 'MOBILE_MONEY' ? (v.mmNumber ?? '') : undefined,
      },
      deliveryOption: this.selectedDelivery(),
      items: lines.map(l => ({
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.product.price,
      })),
      subtotal: this.subtotal(lines),
      total: this.total(lines),
    };

    this.submitting = true;

    // Mock submit (tu peux remplacer par un OrderService + HTTP)
    setTimeout(() => {
      this.submitting = false;
      this.confirmed.emit(payload);

      // Optionnel: vider le panier si tu as clear()
      // (this.cartService as any).clear?.().subscribe?.();
      console.log('ORDER CONFIRMED', payload);
    }, 700);
  }

  // ----- Produit (adapter si ton ProductService a un autre nom) -----
  private loadProduct$(id: string): Observable<Product> {
    const ps: any = this.productService;
    const obs: Observable<any> =
      ps.getProductById?.(id) ??
      ps.getProduct?.(id);

    if (!obs) {
      throw new Error(`ProductService doit exposer getProductById(id) ou getProduct(id).`);
    }

    return obs.pipe(
      map((p: any) => ({
        id: p.id ?? id,
        name: p.name ?? p.title ?? 'Produit',
        price: Number(p.price ?? 0),
        imageUrl: p.imageUrl ?? p.image ?? p.thumbnailUrl ?? '',
        info: p.info ?? p.shortDescription ?? p.brand ?? '',
      }))
    );
  }
}