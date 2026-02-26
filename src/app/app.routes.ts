import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
	},
	{
		path: 'forbidden',
		loadComponent: () => import('./core/pages/forbidden-page/forbidden-page.component').then(m => m.ForbiddenPageComponent),
		title: 'Forbidden'
	},
	{
		path: '',
		// pathMatch: 'full',
		loadChildren: () => import('./storefront/storefront.routes').then(m => m.STOREFRONT_ROUTES),
	},
	{
		path: 'shop',
		loadChildren: () =>
		import('./back-office/back-office.routes').then(m => m.BACK_OFFICE_ROUTES),
		canMatch: [authGuard, roleGuard],
        data: { roles: ['SHOP'] }
	},
	{
		path: 'owner',
		redirectTo: 'shop'
	},
	{
		path: 'admin',
		loadChildren: () =>
		import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
		canMatch: [authGuard, roleGuard],
		data: { roles: ['ADMIN'] }
	},



	{ path: '**', redirectTo: '' }
];
