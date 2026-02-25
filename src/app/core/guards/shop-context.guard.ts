import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { SelectedShopStateService } from '../../back-office/services/selected-shop-state.service';
import { ShopsBackService } from '../../back-office/services/shop.service';

export const shopContextGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const selectedShop = inject(SelectedShopStateService);
  const shopsService = inject(ShopsBackService);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  if (!isBrowser) return true;

  const shopId = route.paramMap.get('shopId');
  if (!shopId) return router.createUrlTree(['/shop']);

  const current = selectedShop.snapshot;
  if (current && current._id === shopId) return true;

  const ownedShop = shopsService.findOwnedShopById(shopId);
  if (!ownedShop) return router.createUrlTree(['/shop']);

  const status = String(ownedShop.status ?? '').toUpperCase();
  if (status !== 'ACTIVE') {
    window.alert('This shop is not active yet.');
    selectedShop.clear();
    return router.createUrlTree(['/shop']);
  }

  selectedShop.setFromShop(ownedShop);
  return true;
};
