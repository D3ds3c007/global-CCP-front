import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay, catchError, tap, map } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthStateService, User } from '../../core/services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly authState = inject(AuthStateService);
  private readonly auth = inject(AuthService);

  private meOnce$?: Observable<User | null>;

  /** Calls /me once per app load and caches result */
  ensureMeLoaded(): Observable<User | null> {
    // If already cached, return it
    if (this.meOnce$) return this.meOnce$;

    const fallbackUser = this.authState.snapshot;

    // Fetch /me to get authoritative user data (including role).
    // If it returns null unexpectedly, keep any existing authenticated user from local state.
    this.meOnce$ = this.auth.me().pipe(
      map((res) => res?.user ?? null),
      tap((user) => {
        if (user) {
          this.authState.setUser(user);
          return;
        }

        if (!fallbackUser) {
          this.authState.setUser(null);
        }
      }),
      map((user) => user ?? fallbackUser ?? null),
      catchError((error) => {
        console.error('AuthSessionService: Error loading user from /me endpoint', error);

        const fallback = this.authState.snapshot ?? fallbackUser;
        if (fallback) {
          return of(fallback);
        }

        this.authState.setUser(null);
        return of(null);
      }),
      shareReplay(1)
    );

    return this.meOnce$;
  }

  /** If you need to force refresh after login/logout */
  resetCache(): void {
    this.meOnce$ = undefined;
  }
}
