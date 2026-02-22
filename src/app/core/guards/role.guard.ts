import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthSessionService } from '../../auth/services/auth-session.service';


type Role = 'BUYER' | 'SHOP' | 'ADMIN';

type MeUser = {
  user:{
    id: string;
    fullName: string;
    email: string;
    role: Role;
    shops: any[];
  }
 
};


export const roleGuard: CanMatchFn = (route) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  const allowed = (route.data?.['roles'] as Role[] | undefined) ?? [];

   return session.ensureMeLoaded().pipe(
    map((user) => {
      const me = user as MeUser | null; // only for guard logic
      if (!me) return router.createUrlTree(['/auth/login']);
      if (allowed.length === 0) { console.log('No roles required, allowing access'); return true; }

      return allowed.includes(me.user.role)
        ? true
        : router.createUrlTree(['/forbidden']);
    })
  );
};