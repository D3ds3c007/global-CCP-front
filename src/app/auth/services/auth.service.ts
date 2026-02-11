import { Injectable } from '@angular/core';
import { of, delay, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(payload: { email: string; password: string }): Observable<{ token: string }> {
    console.log('AuthService.login payload', payload);
    return of({ token: 'mock-token' }).pipe(delay(800));
  }

  register(payload: {
    role: 'BUYER' | 'SHOP_OWNER';
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Observable<{ id: string }> {
    console.log('AuthService.register payload', payload);
    return of({ id: 'mock-user-id' }).pipe(delay(800));
  }
}
