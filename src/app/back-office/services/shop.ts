import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type ShopStatus = 'active' | 'pending';

export interface Shop {
  id: string;
  name: string;
  category: string;   // ex: TECH
  status: ShopStatus; // active/pending
}

@Injectable({ providedIn: 'root' })
export class ShopsService {
  listShops(): Observable<Shop[]> {
    return of<Shop[]>([
      { id: 'massin', name: 'MassIn', category: 'TECH', status: 'active' },
      { id: 'fresh-01', name: 'Fresh Market', category: 'FOOD', status: 'pending' },
      { id: 'mode-11', name: 'Mode11', category: 'FASHION', status: 'active' },
    ]).pipe(delay(200));
  }
}