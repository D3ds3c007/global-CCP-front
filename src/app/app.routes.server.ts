import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'shop/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'owner/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'cart/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'manufacturers/:shopId',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
