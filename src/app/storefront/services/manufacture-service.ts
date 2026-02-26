import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Manufacture {
  id?: string;
  nom: string;
  categoryName?: string | null;
  description: string;
  logoUrl: string;
  coverUrl?: string;
  status?: string;
  contact: {
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
  };
  socials?: {
    facebook?: string | null;
    instagram?: string | null;
    website?: string | null;
  };
}

interface BackendShopContact {
  phone?: string;
  email?: string;
  address?: string;
}

interface BackendShopSocials {
  facebook?: string;
  instagram?: string;
  website?: string;
}

interface BackendShop {
  _id: string;
  name: string;
  categoryId?: string | { _id?: string; name?: string };
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  status?: string;
  contact?: BackendShopContact;
  socials?: BackendShopSocials;
}

interface GetShopResponse {
  shop: BackendShop;
}

interface BackendCategory {
  _id: string;
  name: string;
}

interface GetCategoriesByTypeResponse {
  categories: BackendCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class ManufactureService {
  private readonly http = inject(HttpClient);
  private readonly shopsUrl = `${environment.apiUrl}shops`;
  private readonly categoriesUrl = `${environment.apiUrl}categories`;
  private readonly placeholderImage = 'https://via.placeholder.com/800x560?text=Shop';

  // Backward-compatible mock method used by older storefront components.
  getBoutiqueMock(): Observable<Manufacture> {
    return of({
      nom: 'Ma Boutique',
      categoryName: null,
      description: '',
      logoUrl: this.placeholderImage,
      coverUrl: this.placeholderImage,
      contact: {
        telephone: null,
        email: null,
        adresse: null,
      },
      socials: {
        facebook: null,
        instagram: null,
        website: null,
      },
    });
  }

  getBoutiqueById(shopId: string): Observable<Manufacture | null> {
    if (!shopId?.trim()) {
      return of(null);
    }

    return this.http.get<GetShopResponse>(`${this.shopsUrl}/${shopId}`, { withCredentials: true }).pipe(
      switchMap(({ shop }) => {
        const embeddedCategoryName = this.extractCategoryName(shop.categoryId);
        if (embeddedCategoryName) {
          return of(this.mapShop(shop, embeddedCategoryName));
        }

        const categoryId = this.extractCategoryId(shop.categoryId);
        if (!categoryId) {
          return of(this.mapShop(shop, null));
        }

        return this.getShopCategoryNameById(categoryId).pipe(
          map(categoryName => this.mapShop(shop, categoryName))
        );
      }),
      catchError(error => {
        console.error('getBoutiqueById failed', error);
        return of(null);
      })
    );
  }

  private mapShop(shop: BackendShop, categoryName: string | null): Manufacture {
    const logoUrl = this.toPictureUrl(shop.logoUrl) ?? this.placeholderImage;
    const coverUrl = this.toPictureUrl(shop.coverUrl) ?? logoUrl;

    return {
      id: shop._id,
      nom: shop.name,
      categoryName,
      description: shop.description ?? '',
      logoUrl,
      coverUrl,
      status: shop.status,
      contact: {
        telephone: shop.contact?.phone ?? null,
        email: shop.contact?.email ?? null,
        adresse: shop.contact?.address ?? null,
      },
      socials: {
        facebook: shop.socials?.facebook ?? null,
        instagram: shop.socials?.instagram ?? null,
        website: shop.socials?.website ?? null,
      },
    };
  }

  private getShopCategoryNameById(categoryId: string): Observable<string | null> {
    const params = new HttpParams().set('type', 'SHOP');

    return this.http.get<GetCategoriesByTypeResponse>(`${this.categoriesUrl}/getByType`, { params }).pipe(
      map(response => {
        const match = (response.categories ?? []).find(category => category._id === categoryId);
        return match?.name ?? null;
      }),
      catchError(error => {
        console.warn('getShopCategoryNameById failed', error);
        return of(null);
      })
    );
  }

  private extractCategoryName(value: BackendShop['categoryId']): string | null {
    if (value && typeof value === 'object' && typeof value.name === 'string' && value.name.trim()) {
      return value.name;
    }

    return null;
  }

  private extractCategoryId(value: BackendShop['categoryId']): string | null {
    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (value && typeof value === 'object' && typeof value._id === 'string' && value._id.trim()) {
      return value._id;
    }

    return null;
  }

  private toPictureUrl(value?: string): string | null {
    if (!value?.trim()) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `${environment.pictureUrl}logo/${value.replace(/^\/+/, '')}`;
  }
}
