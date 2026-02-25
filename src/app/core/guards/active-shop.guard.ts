import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthSessionService } from '../../auth/services/auth-session.service';

export const activeShopGuard: CanActivateFn = (route) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) return true;

  const shopId = route.paramMap.get('shopId');
  if (!shopId) return router.createUrlTree(['/owner/dashboard']);

  return session.ensureMeLoaded().pipe(
    take(1),
    map((user) => {
      const shop = user?.shops?.find((s: any) => String(s?._id) === shopId);
      const status = String(shop?.status ?? '').toUpperCase();

      if (status === 'ACTIVE') return true;

      window.alert('This shop is not active yet.');
      return router.createUrlTree(['/owner/dashboard']);
    })
  );
};
