import { Routes } from '@angular/router';

import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component';
import { ManufacturePage } from './pages/manufacture-page/manufacture-page';
import { ProductDetailsPage } from './pages/product-detail-page/product-detail-page';
import { CartPage } from './pages/cart-page/cart-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { OrderPage } from './pages/order-page/order-page';
import { HistoryPage } from './pages/history-page/history-page';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';

export const STOREFRONT_ROUTES: Routes = [
  {
    path: 'history',
    component: HistoryPage,
    title: 'History',
    canMatch: [authGuard, roleGuard],
    data:{ roles: ['BUYER'] }
  },
  {
    path: 'orders',
    component: OrderPage,
    title: 'Orders',
    canMatch: [authGuard, roleGuard],
    data:{ roles: ['BUYER'] }
  },
  {
    path: 'checkout',
    component: CheckoutPage,
    title: 'Checkout',
    canMatch: [authGuard, roleGuard],
    data:{ roles: ['BUYER'] }
  },
  {
    path: 'cart',
    component: CartPage,
    title: 'Cart',
    canMatch: [authGuard, roleGuard],
    data:{ roles: ['BUYER'] }
  },
  { path: 'product/:id',
    component: ProductDetailsPage,
    title: 'Product Details',
    canMatch: [authGuard, roleGuard],
    data:{ roles: ['BUYER'] }
  },
  {
    path: 'manufacturers/:shopId',
    component: ManufacturePage,
    title: 'Manufacturer Profile'
  },
  {
    path: 'manufacturers',
    component: ManufacturePage,
    title: 'Manufacturers'
  },
  {
    path: '',
    component: StorefrontPageComponent,
    title: 'Storefront'
  }

];
