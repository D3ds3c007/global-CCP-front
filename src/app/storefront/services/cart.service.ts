import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, map } from 'rxjs';

export interface CartItemsState {
  [productId: string]: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'storefront_cart_items';
  private readonly itemsSubject = new BehaviorSubject<CartItemsState>(this.loadInitialState());
  readonly cartItems$ = this.itemsSubject.asObservable();

  // (Optionnel) dérivés utiles
  readonly productIds$ = this.cartItems$.pipe(map(s => Object.keys(s)));
  readonly totalQuantity$ = this.cartItems$.pipe(
    map(s => Object.values(s).reduce((sum, q) => sum + q, 0))
  );

  /** IMPORTANT : on garde la signature et le comportement */
  addItem(productId: string, qty: number): Observable<void> {
    return of(undefined).pipe(
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

        this.persistState(this.itemsSubject.getValue());

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
      tap(() => {
        const current = this.itemsSubject.getValue();

        if (safeQty <= 0) {
          const { [productId]: _, ...rest } = current;
          this.itemsSubject.next(rest);
        } else {
          this.itemsSubject.next({ ...current, [productId]: safeQty });
        }

        this.persistState(this.itemsSubject.getValue());

        console.log('CartService.updateQuantity', productId, safeQty);
      })
    );
  }

  /** Supprime une ligne du panier */
  removeItem(productId: string): Observable<void> {
    return of(undefined).pipe(
      tap(() => {
        const current = this.itemsSubject.getValue();
        if (!(productId in current)) return;

        const { [productId]: _, ...rest } = current;
        this.itemsSubject.next(rest);
        this.persistState(rest);

        console.log('CartService.removeItem', productId);
      })
    );
  }

  /** Vide le panier */
  clear(): Observable<void> {
    return of(undefined).pipe(
      tap(() => {
        this.itemsSubject.next({});
        this.persistState({});
        console.log('CartService.clear');
      })
    );
  }

  private loadInitialState(): CartItemsState {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return {};
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }

      return Object.entries(parsed as Record<string, unknown>).reduce<CartItemsState>((acc, [id, value]) => {
        const quantity = Math.floor(Number(value));
        if (quantity > 0) {
          acc[id] = quantity;
        }
        return acc;
      }, {});
    } catch {
      return {};
    }
  }

  private persistState(state: CartItemsState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch {}
  }
}