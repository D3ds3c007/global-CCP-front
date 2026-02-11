import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, tap } from 'rxjs';

export interface CartItemsState {
  [productId: string]: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSubject = new BehaviorSubject<CartItemsState>({});
  readonly cartItems$ = this.itemsSubject.asObservable();

  addItem(productId: string, qty: number): Observable<void> {
    return of(undefined).pipe(
      delay(200),
      tap(() => {
        const current = this.itemsSubject.getValue();
        const nextQty = (current[productId] ?? 0) + qty;
        this.itemsSubject.next({ ...current, [productId]: nextQty });
        console.log('CartService.addItem', productId, qty);
      })
    );
  }
}
