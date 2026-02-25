import { Routes } from '@angular/router';
import { BackOfficeLayout } from './pages/back-office-layout/back-office-layout';
import { shopContextGuard } from '../core/guards/shop-context.guard';

export const BACK_OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackOfficeLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/shops-list-page/shops-list-page').then((m) => m.ShopsListPage),
      },
      {
        path: ':shopId/dashboard',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
        canActivate: [shopContextGuard],
      },
      {
        path: ':shopId/customers',
        loadComponent: () =>
          import('./pages/customers-page/customers-page').then((m) => m.CustomersPage),
        canActivate: [shopContextGuard],
      },
      {
        path: ':shopId/products',
        loadComponent: () =>
          import('./pages/products-page/products-page').then((m) => m.ProductsPage),
        canActivate: [shopContextGuard],
      },
      {
        path: ':shopId/orders',
        loadComponent: () =>
          import('./pages/orders-page/orders-page').then((m) => m.OrdersPage),
        canActivate: [shopContextGuard],
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
