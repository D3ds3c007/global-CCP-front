import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$: Observable<User | null> = this.userSubject.asObservable();

  loginMock(user: User): void {
    this.userSubject.next({ ...user });
  }

  logout(): void {
    this.userSubject.next(null);
  }
}
