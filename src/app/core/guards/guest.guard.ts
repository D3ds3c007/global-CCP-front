import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { map, take } from 'rxjs';
import { AuthSessionService } from '../../auth/services/auth-session.service';

export const guestGuard: CanMatchFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // SSR: allow render, don't redirect on server
  if (!isBrowser) return true;

  return session.ensureMeLoaded().pipe(
    take(1),
    map((user) => {
      if (user) {
        // 🔥 Already logged → redirect away from login
        return router.createUrlTree(['/']);
      }

      // Not logged → allow login page
      return true;
    })
  );
};