import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type UserRole = 'BUYER' | 'SHOP' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: UserRole;
  shops: any[];
}

const LS_USER_KEY = 'auth_user_v1';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly userSubject = new BehaviorSubject<User | null>(this.loadFromStorage());
  readonly currentUser$: Observable<User | null> = this.userSubject.asObservable();

  setUser(user: User | null): void {
    // ✅ always update memory
    this.userSubject.next(user ? { ...user } : null);

    // ✅ only persist in browser
    if (this.isBrowser) this.saveToStorage(user);
  }

  logout(): void {
    this.setUser(null);
  }

  get snapshot(): User | null {
    return this.userSubject.value;
  }

  private saveToStorage(user: User | null): void {
    if (!user) {
      localStorage.removeItem(LS_USER_KEY);
      return;
    }
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  }

  private loadFromStorage(): User | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      localStorage.removeItem(LS_USER_KEY);
      return null;
    }
  }
}