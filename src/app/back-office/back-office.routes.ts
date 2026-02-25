import { Routes } from '@angular/router';
import { BackOfficeLayout } from './pages/back-office-layout/back-office-layout';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { activeShopGuard } from '../core/guards/active-shop.guard';

export const BACK_OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackOfficeLayout,
    children: [
        {
            path: 'customers',
            loadComponent: () =>
            import('./pages/customers-page/customers-page').then(m => m.CustomersPage),
        },
      // /owner/dashboard => liste shops
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/shops-list-page/shops-list-page').then(m => m.ShopsListPage),
        // canMatch: [authGuard, roleGuard],
        // data: { roles: ['SHOP'] }
      },

      // /owner/dashboard/:shopId => page dashboard déjà terminée
      {
        path: 'dashboard/:shopId',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
        canActivate: [activeShopGuard],
      },

      // /owner/products
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/products-page/products-page').then(m => m.ProductsPage),
      },
      {
        path: 'orders',
        loadComponent: () =>
            import('./pages/orders-page/orders-page').then(m => m.OrdersPage),
    },

      // default
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      // optionnel: route inconnue => dashboard
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
