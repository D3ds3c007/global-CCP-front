import { Routes } from '@angular/router';
import { AdminLayout } from './pages/admin-layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'shops' },

      { path: 'shops', loadComponent: () => import('./pages/admin-shops-page/admin-shops-page').then(m => m.AdminShopsPage) },

      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin-categories-page/admin-categories-page').then(m => m.AdminCategoriesPage),
      },

      { path: '**', redirectTo: 'shops' },
    ],
  },
];