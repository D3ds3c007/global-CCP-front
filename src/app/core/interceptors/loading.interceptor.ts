import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

function isAssetRequest(url: string): boolean {
  return url.startsWith('assets/') || url.includes('/assets/');
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (isAssetRequest(req.url)) {
    return next(req);
  }

  const loading = inject(LoadingService);
  loading.startRequest();

  return next(req).pipe(finalize(() => loading.endRequest()));
};
