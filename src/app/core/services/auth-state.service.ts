import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  fullName: string;
  email: string;
  shops: any[]; // à typer selon les besoins
}

const LS_USER_KEY = 'auth_user_v1';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$: Observable<User | null> = this.userSubject.asObservable();
  

  setUser(user: User | null): void {
    if (!this.isBrowser) return;
    this.userSubject.next(user ? { ...user } : null);
    this.saveUser(user);
  }
  private saveUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(LS_USER_KEY);
      return;
    }
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  }

    getUserFromStorage(): User | null {
    if (!this.isBrowser) return null; // safeguard for SSR
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  loginMock(user: User): void {
    this.userSubject.next({ ...user });
  }

  logout(): void {
    this.userSubject.next(null);
  }
}
