import { Routes } from '@angular/router';
import { DashboardPage } from '../back-office/pages/dashboard-page/dashboard-page';
import { BackOfficeLayout } from './pages/back-office-layout/back-office-layout';

export const BACK_OFFICE_ROUTES: Routes = [
    {
        path: '',
        component: BackOfficeLayout,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
            {
                path: 'dashboard',
                loadComponent: () =>
                import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
            },
        ],
    }
];
