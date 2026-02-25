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
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
