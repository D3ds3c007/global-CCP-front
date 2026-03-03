import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { AuthStateService } from '../../core/services/auth-state.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

export type ShopStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface ShopCategory {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface contactInfo {
  email: string;
  phone: string;
  address: string;
}

export interface SocialsInfo {
  facebook: string;
  instagram: string;
  website: string;
}

export interface category {
  id: string;
  name: string;
}

export interface Shop {
  _id: string;
  name: string;
  category: category;
  status: string;
  logoUrl: string;
  coverUrl?: string;
  ownerId: string;
  description?: string;
  openingHours?: string;
  contact?: contactInfo;
  socials?: SocialsInfo;
}

export interface CreateShopPayload {
  name: string;
  description?: string;
  categoryId: string;
  categoryName?: string;
  openingHours?: string;
  phone: string;
  email?: string;
  address?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  logoFile?: File | null;
}

export interface ShopsQuery {
  search: string;
  categoryId: string | 'all';
  status: ShopStatus | 'all';
}

export interface ShopsVM {
  categories: ShopCategory[];
  query: ShopsQuery;
  shops: Shop[];
}


@Injectable({ providedIn: 'root' })
export class ShopsBackService {
  private apiUrl = environment.apiUrl;
  
  private readonly categoriesSubject = new BehaviorSubject<ShopCategory[]>([]);
  readonly categories$ = this.categoriesSubject.asObservable();

  readonly categories: ShopCategory[] = [];

  private readonly authState = inject(AuthStateService);
  private readonly currentUser$ = this.authState.currentUser$;
  private readonly shopsSubject = new BehaviorSubject<Shop[]>(this.seedShops());

  private readonly querySubject = new BehaviorSubject<ShopsQuery>({
    search: '',
    categoryId: 'all',
    status: 'all',
  });

  readonly query$ = this.querySubject.asObservable();

  readonly shopsFiltered$ = combineLatest([this.shopsSubject, this.querySubject]).pipe(
    map(([shops, q]) => {
      const s = q.search.trim().toLowerCase();
      return shops.filter(sh => {
        const matchSearch = !s || sh.name.toLowerCase().includes(s);
        const matchCat = q.categoryId === 'all' || sh.category.id === q.categoryId;
        const matchStatus = q.status === 'all' || sh.status === q.status;
        return matchSearch && matchCat && matchStatus;
      });
    })
  );

  readonly vm$: Observable<ShopsVM> = combineLatest({
    categories: this.categories$,
    query: this.query$,
    shops: this.shopsFiltered$,
  });

  constructor(private http: HttpClient) {
    // this.loadCategories();
  } 

  get shopsSnapshot(): Shop[] {
    return this.shopsSubject.value;
  }

  findOwnedShopById(shopId: string): Shop | undefined {
    return this.shopsSubject.value.find((shop) => String(shop._id) === String(shopId));
  }

  setCategories(categories: ShopCategory[]): void {
    this.categoriesSubject.next(categories);
  }

  loadCategories(): Observable<ShopCategory[]> {

    const params = new HttpParams().set('type', 'SHOP');

    return this.http
      .get<ShopCategory[]>(`${this.apiUrl}categories`, { params, withCredentials: true })
      .pipe(tap(categories => this.setCategories(categories ?? [])));
  }

  setQuery(patch: Partial<ShopsQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  create(value: Omit<Shop, '_id'>) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'shop-' + Date.now();

    const next: Shop[] = [{ _id: id, ...value }, ...this.shopsSubject.value];
    this.shopsSubject.next(next);
  }

  createShop(payload: CreateShopPayload): Observable<Shop> {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('categoryId', payload.categoryId);
    formData.append('phone', payload.phone);

    if (payload.description?.trim()) formData.append('description', payload.description.trim());
    if (payload.openingHours?.trim()) formData.append('openingHours', payload.openingHours.trim());
    if (payload.email?.trim()) formData.append('email', payload.email.trim());
    if (payload.address?.trim()) formData.append('address', payload.address.trim());
    if (payload.facebook?.trim()) formData.append('facebook', payload.facebook.trim());
    if (payload.instagram?.trim()) formData.append('instagram', payload.instagram.trim());
    if (payload.website?.trim()) formData.append('website', payload.website.trim());
    if (payload.logoFile) formData.append('logo', payload.logoFile);

    return this.http
      .post<{ message: string; shop: any }>(`${this.apiUrl}shops`, formData, { withCredentials: true })
      .pipe(
        map(res => this.mapApiShopToUi(res.shop, payload)),
        tap(createdShop => this.prependShop(createdShop))
      );
  }

  private prependShop(shop: Shop): void {
    this.shopsSubject.next([shop, ...this.shopsSubject.value]);
  }

  private mapApiShopToUi(apiShop: any, payload?: CreateShopPayload): Shop {
    const fallbackCategoryId = String(apiShop?.categoryId ?? payload?.categoryId ?? '');
    const fallbackCategoryName = payload?.categoryName ?? fallbackCategoryId;

    return {
      _id: String(apiShop?._id ?? ''),
      name: String(apiShop?.name ?? payload?.name ?? ''),
      category: {
        id: fallbackCategoryId,
        name: fallbackCategoryName,
      },
      status: String(apiShop?.status ?? 'PENDING'),
      logoUrl: String(apiShop?.logoUrl ?? 'default.png'),
      coverUrl: apiShop?.coverUrl ?? undefined,
      ownerId: String(apiShop?.ownerUserId ?? this.authState.snapshot?.id ?? ''),
      description: apiShop?.description ?? payload?.description ?? '',
      openingHours: apiShop?.openingHours ?? payload?.openingHours ?? '',
      contact: {
        phone: String(apiShop?.contact?.phone ?? payload?.phone ?? ''),
        email: String(apiShop?.contact?.email ?? payload?.email ?? ''),
        address: String(apiShop?.contact?.address ?? payload?.address ?? ''),
      },
      socials: {
        facebook: String(apiShop?.socials?.facebook ?? payload?.facebook ?? ''),
        instagram: String(apiShop?.socials?.instagram ?? payload?.instagram ?? ''),
        website: String(apiShop?.socials?.website ?? payload?.website ?? ''),
      },
    };
  }

  private seedShops(): Shop[] {

    //retunr shops from currentuser$
    const user = this.authState.snapshot;
    const userFromState = this.currentUser$;
    //show how to get user shops from authStatesnapshot or currentUser$ observable
    userFromState.subscribe(u => console.log('userFromState subscribe', u));
    if (!user) return [];
    let store = user.shops.map((sh: any) => ({
      _id: sh._id,
      name: sh.name,
      category: sh.category,
      status: sh.status,
      logoUrl: sh.logoUrl,
      ownerId: user.id,
      description: sh.description,
      openingHours: sh.openingHours,
      contact: sh.contact
        ? {
            email: sh.contact.email ?? '',
            phone: sh.contact.phone ?? '',
            address: sh.contact.address ?? '',
          }
        : undefined,
      socials: sh.socials
        ? {
            facebook: sh.socials.facebook ?? '',
            instagram: sh.socials.instagram ?? '',
            website: sh.socials.website ?? '',
          }
        : undefined,
    }));

    console.log('Seeded shops', store);
    return store;


  }

   
}
