import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Shop } from './shop.service';

export type SelectedShopContext = {
  _id: string;
  name: string;
  status: string;
  logoUrl?: string;
};

const SS_KEY = 'selected_shop_context_v1';

@Injectable({ providedIn: 'root' })
export class SelectedShopStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly subject = new BehaviorSubject<SelectedShopContext | null>(this.load());
  readonly selectedShop$ = this.subject.asObservable();

  get snapshot(): SelectedShopContext | null {
    return this.subject.value;
  }

  set(shop: SelectedShopContext | null): void {
    this.subject.next(shop ? { ...shop } : null);

    if (!this.isBrowser) return;
    if (!shop) {
      sessionStorage.removeItem(SS_KEY);
      return;
    }
    sessionStorage.setItem(SS_KEY, JSON.stringify(shop));
  }

  setFromShop(shop: Shop): void {
    this.set({
      _id: String(shop._id),
      name: String(shop.name ?? ''),
      status: String(shop.status ?? ''),
      logoUrl: shop.logoUrl,
    });
  }

  clear(): void {
    this.set(null);
  }

  private load(): SelectedShopContext | null {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? (JSON.parse(raw) as SelectedShopContext) : null;
    } catch {
      sessionStorage.removeItem(SS_KEY);
      return null;
    }
  }
}
