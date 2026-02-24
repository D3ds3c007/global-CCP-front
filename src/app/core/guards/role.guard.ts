import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthSessionService } from '../../auth/services/auth-session.service';
import { User, UserRole } from '../services/auth-state.service';

export const roleGuard: CanMatchFn = (route) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  const allowedRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];

  // Avoid SSR redirects on direct URL entry; let the browser evaluate auth/role.
  if (!isBrowser) return true;

  return session.ensureMeLoaded().pipe(
    map((user: User | null) => {
      console.log('RoleGuard - checking user:', user, 'allowed roles:', allowedRoles);
      
      // ✅ If no user, redirect to login
      if (!user) {
        console.warn('RoleGuard - no user found, redirecting to login');
        return router.createUrlTree(['/auth/login']);
      }

      // ✅ If no roles are required, allow access
      if (allowedRoles.length === 0) {
        console.log('RoleGuard - no roles required, allowing access');
        return true;
      }

      // ✅ Check if user has one of the allowed roles
      if (!user.role) {
        console.warn('RoleGuard - user has no role assigned, redirecting to login');
        return router.createUrlTree(['/auth/login']);
      }

      const hasRole = allowedRoles.includes(user.role);
      console.log('RoleGuard - user role:', user.role, 'has required role:', hasRole);

      return hasRole
        ? true
        : router.createUrlTree(['/forbidden']);
    })
  );
};
