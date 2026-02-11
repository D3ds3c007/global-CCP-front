import { Routes } from '@angular/router';

import { StorefrontPageComponent } from './pages/storefront-page/storefront-page.component';

export const STOREFRONT_ROUTES: Routes = [
  { path: '', component: StorefrontPageComponent, title: 'Storefront' }
];
