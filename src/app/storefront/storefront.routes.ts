import { Routes } from '@angular/router';

import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component';
import { ManufacturePage } from './pages/manufacture-page/manufacture-page';
import { ProductDetailsPage } from './pages/product-detail-page/product-detail-page';
import { CartPage } from './pages/cart-page/cart-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { OrderPage } from './pages/order-page/order-page';
import { HistoryPage } from './pages/history-page/history-page';

export const STOREFRONT_ROUTES: Routes = [
  {
    path: 'history',
    component: HistoryPage,
    title: 'History'
  },
  {
    path: 'orders',
    component: OrderPage,
    title: 'Orders'
  },
  {
    path: 'checkout',
    component: CheckoutPage,
    title: 'Checkout'
  },
  {
    path: 'cart',
    component: CartPage,
    title: 'Cart'
  },
  { path: 'product/:id',
    component: ProductDetailsPage,
    title: 'Product Details'
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
