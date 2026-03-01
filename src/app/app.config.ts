import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ShoppingCartOutline, UserOutline } from '@ant-design/icons-angular/icons';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withNoHttpTransferCache } from '@angular/platform-browser';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { APP_CURRENCY, APP_LOCALE } from './core/constants/app-locale';

registerLocaleData(localeEn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    { provide: LOCALE_ID, useValue: APP_LOCALE },
    { provide: DEFAULT_CURRENCY_CODE, useValue: APP_CURRENCY },
    provideNzIcons([
      ShoppingCartOutline,
      UserOutline
    ])
  ]
};
