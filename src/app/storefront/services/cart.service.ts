import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap, map } from 'rxjs';

export interface CartItemsState {
  [productId: string]: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItemsState>({});
  readonly cartItems$ = this.itemsSubject.asObservable();

  // (Optionnel) dérivés utiles
  readonly productIds$ = this.cartItems$.pipe(map(s => Object.keys(s)));
  readonly totalQuantity$ = this.cartItems$.pipe(
    map(s => Object.values(s).reduce((sum, q) => sum + q, 0))
  );

  /** IMPORTANT : on garde la signature et le comportement */
  addItem(productId: string, qty: number): Observable<void> {
    return of(undefined).pipe(
      delay(200),
      tap(() => {
        const current = this.itemsSubject.getValue();
        const nextQty = (current[productId] ?? 0) + qty;

        // si qty tombe à 0 ou moins, on enlève la ligne
        if (nextQty <= 0) {
          const { [productId]: _, ...rest } = current;
          this.itemsSubject.next(rest);
        } else {
          this.itemsSubject.next({ ...current, [productId]: nextQty });
        }

        console.log('CartService.addItem', productId, qty);
      })
    );
  }

  /** +1 (ou step) */
  increment(productId: string, step = 1): Observable<void> {
    return this.addItem(productId, Math.max(1, step));
  }

  /** -1 (ou step) */
  decrement(productId: string, step = 1): Observable<void> {
    return this.addItem(productId, -Math.max(1, step));
  }

  /** Met la quantité exactement à qty (si <=0 => remove) */
  updateQuantity(productId: string, qty: number): Observable<void> {
    const safeQty = Math.floor(Number(qty) || 0);

    return of(undefined).pipe(
      delay(200),
      tap(() => {
        const current = this.itemsSubject.getValue();

        if (safeQty <= 0) {
          const { [productId]: _, ...rest } = current;
          this.itemsSubject.next(rest);
        } else {
          this.itemsSubject.next({ ...current, [productId]: safeQty });
        }

        console.log('CartService.updateQuantity', productId, safeQty);
      })
    );
  }

  /** Supprime une ligne du panier */
  removeItem(productId: string): Observable<void> {
    return of(undefined).pipe(
      delay(200),
      tap(() => {
        const current = this.itemsSubject.getValue();
        if (!(productId in current)) return;

        const { [productId]: _, ...rest } = current;
        this.itemsSubject.next(rest);

        console.log('CartService.removeItem', productId);
      })
    );
  }

  /** Vide le panier */
  clear(): Observable<void> {
    return of(undefined).pipe(
      delay(200),
      tap(() => {
        this.itemsSubject.next({});
        console.log('CartService.clear');
      })
    );
  }
}