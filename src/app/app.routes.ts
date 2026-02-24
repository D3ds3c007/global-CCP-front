import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'auth',
		loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
	},
	{
		path: '',
		// pathMatch: 'full',
		loadChildren: () => import('./storefront/storefront.routes').then(m => m.STOREFRONT_ROUTES)
	},
	{
		path: 'owner',
		loadChildren: () =>
		import('./back-office/back-office.routes').then(m => m.BACK_OFFICE_ROUTES),
	},


	{ path: '**', redirectTo: '' }
];
