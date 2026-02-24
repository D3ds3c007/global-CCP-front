import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, catchError, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthStateService, User } from '../../core/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
    private meOnce$?: Observable<User | null>;

    constructor(private auth: AuthService, private authState: AuthStateService) {}

    /** Calls /me once per app load and caches result */
     ensureMeLoaded(): Observable<User | null> {
    if (this.meOnce$) return this.meOnce$;

    this.meOnce$ = this.auth.me().pipe(
      tap((res) => this.authState.setUser(res?.user ?? null)),
      catchError(() => {
        this.authState.setUser(null);
        return of(null);
      }),
      shareReplay(1)
    );
    console.log('AuthSessionService.ensureMeLoaded called, meOnce$ set');
    return this.meOnce$;
  }

  /** If you need to force refresh after login/logout */
  resetCache(): void {
    this.meOnce$ = undefined;
  }
}