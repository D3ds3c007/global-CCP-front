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



	{ path: '**', redirectTo: '' }
];
