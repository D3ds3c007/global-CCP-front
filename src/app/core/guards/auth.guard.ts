import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { map, take } from 'rxjs';
import { AuthSessionService } from '../../auth/services/auth-session.service';

export const authGuard: CanMatchFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // ✅ SSR: don't redirect during server render
  if (!isBrowser) return true;

  // ✅ Browser: real auth check
  return session.ensureMeLoaded().pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/auth/login'])))
  );
};