import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  storeName: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  // optionnel pour le carrousel
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
}

export type SortOption = 'PRICE_ASC' | 'PRICE_DESC';

export interface SearchQuery {
  keyword: string;
  minPrice: number | null;
  maxPrice: number | null;
  categoryIds: string[];
  sort: SortOption;
}

export const createDefaultSearchQuery = (): SearchQuery => ({
  keyword: '',
  minPrice: null,
  maxPrice: null,
  categoryIds: [],
  sort: 'PRICE_ASC'
});

const CATEGORIES: Category[] = [
  { id: 'cat-home', name: 'Home & Kitchen' },
  { id: 'cat-electronics', name: 'Electronics' },
  { id: 'cat-fashion', name: 'Fashion' },
  { id: 'cat-sports', name: 'Sports' },
  { id: 'cat-beauty', name: 'Beauty' }
];

const PRODUCTS: Product[] = [
  {
    id: 'p-1001',
    name: 'Smart LED Desk Lamp',
    storeName: 'BrightHouse Co.',
    price: 48,
    stock: 12,
    imageUrl: 'https://picsum.photos/id/1062/800/560',
    categoryId: 'cat-home',

    images: [
      'https://picsum.photos/id/1062/800/560',
      'https://picsum.photos/id/1063/800/560',
      'https://picsum.photos/id/1064/800/560'
    ]
  },
  {
    id: 'p-1002',
    name: 'Wireless Earbuds Pro',
    storeName: 'SoundBays',
    price: 89,
    stock: 25,
    imageUrl: 'https://picsum.photos/id/1060/800/560',
    categoryId: 'cat-electronics'
  },
  {
    id: 'p-1003',
    name: 'Premium Yoga Mat',
    storeName: 'FlexCore',
    price: 35,
    stock: 40,
    imageUrl: 'https://picsum.photos/id/1057/800/560',
    categoryId: 'cat-sports'
  },
  {
    id: 'p-1004',
    name: 'Stainless Cookware Set',
    storeName: 'KitchenNova',
    price: 129,
    stock: 9,
    imageUrl: 'https://picsum.photos/id/1059/800/560',
    categoryId: 'cat-home'
  },
  {
    id: 'p-1005',
    name: 'Minimalist Sneakers',
    storeName: 'Stride Studio',
    price: 72,
    stock: 18,
    imageUrl: 'https://picsum.photos/id/1035/800/560',
    categoryId: 'cat-fashion'
  },
  {
    id: 'p-1006',
    name: 'Silk Skin Serum',
    storeName: 'GlowLabs',
    price: 54,
    stock: 0,
    imageUrl: 'https://picsum.photos/id/1027/800/560',
    categoryId: 'cat-beauty'
  },
  {
    id: 'p-1007',
    name: 'Portable Power Bank 20k',
    storeName: 'VoltEdge',
    price: 64,
    stock: 31,
    imageUrl: 'https://picsum.photos/id/1011/800/560',
    categoryId: 'cat-electronics'
  },
  {
    id: 'p-1008',
    name: 'Smart Fitness Watch',
    storeName: 'PulseGear',
    price: 149,
    stock: 11,
    imageUrl: 'https://picsum.photos/id/1016/800/560',
    categoryId: 'cat-electronics'
  },
  {
    id: 'p-1009',
    name: 'Cotton Lounge Set',
    storeName: 'CloudNine',
    price: 58,
    stock: 27,
    imageUrl: 'https://picsum.photos/id/1003/800/560',
    categoryId: 'cat-fashion'
  },
  {
    id: 'p-1010',
    name: 'Aroma Diffuser Deluxe',
    storeName: 'AuraHome',
    price: 42,
    stock: 16,
    imageUrl: 'https://picsum.photos/id/1006/800/560',
    categoryId: 'cat-home'
  },
  {
    id: 'p-1011',
    name: 'Hydrating Face Mist',
    storeName: 'BloomCare',
    price: 29,
    stock: 44,
    imageUrl: 'https://picsum.photos/id/1024/800/560',
    categoryId: 'cat-beauty'
  },
  {
    id: 'p-1012',
    name: 'Trail Running Backpack',
    storeName: 'SummitWorks',
    price: 96,
    stock: 7,
    imageUrl: 'https://picsum.photos/id/1039/800/560',
    categoryId: 'cat-sports'
  },
  {
    id: 'p-1013',
    name: 'Ceramic Dinnerware Set',
    storeName: 'Hearth & Co.',
    price: 110,
    stock: 13,
    imageUrl: 'https://picsum.photos/id/1040/800/560',
    categoryId: 'cat-home'
  },
  {
    id: 'p-1014',
    name: 'Noise Cancel Headphones',
    storeName: 'Sonix',
    price: 199,
    stock: 5,
    imageUrl: 'https://picsum.photos/id/1042/800/560',
    categoryId: 'cat-electronics'
  },
  {
    id: 'p-1015',
    name: 'Everyday Leather Tote',
    storeName: 'Muse Atelier',
    price: 138,
    stock: 10,
    imageUrl: 'https://picsum.photos/id/1067/800/560',
    categoryId: 'cat-fashion'
  },
  {
    id: 'p-1016',
    name: 'Performance Protein Shaker',
    storeName: 'FuelLab',
    price: 24,
    stock: 38,
    imageUrl: 'https://picsum.photos/id/1074/800/560',
    categoryId: 'cat-sports'
  },
  {
    id: 'p-1017',
    name: 'Matte Lip Color Set',
    storeName: 'LuxeTint',
    price: 39,
    stock: 22,
    imageUrl: 'https://picsum.photos/id/1080/800/560',
    categoryId: 'cat-beauty'
  },
  {
    id: 'p-1018',
    name: 'Smart Home Hub Mini',
    storeName: 'NexaHome',
    price: 75,
    stock: 19,
    imageUrl: 'https://picsum.photos/id/1084/800/560',
    categoryId: 'cat-electronics'
  }
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  handleAddToCart(e: { productId: string; quantity: number }) {
    console.log('ADD TO CART', e);
  }

  getProductById(id: string): Observable<Product | undefined> {
    const found = PRODUCTS.find(p => p.id === id);
    // on retourne une copie pour éviter les mutations
    return of(found ? { ...found } : undefined).pipe(delay(300));
  }

  getCategories(): Observable<Category[]> {
    return of([...CATEGORIES]).pipe(delay(300));
  }

  getTopProducts(): Observable<Product[]> {
    const top = PRODUCTS.filter(product => product.stock > 0).slice(0, 5);
    return of([...top]).pipe(delay(300));
  }

  searchProducts(
    query: SearchQuery,
    pageIndex: number,
    pageSize: number
  ): Observable<{ items: Product[]; total: number }> {
    const keyword = query.keyword.trim().toLowerCase();

    const filtered = PRODUCTS.filter(product => {
      const matchesKeyword =
        keyword.length === 0 ||
        product.name.toLowerCase().includes(keyword) ||
        product.storeName.toLowerCase().includes(keyword);

      const matchesMin = query.minPrice === null || product.price >= query.minPrice;
      const matchesMax = query.maxPrice === null || product.price <= query.maxPrice;

      const matchesCategory =
        query.categoryIds.length === 0 || query.categoryIds.includes(product.categoryId);

      return matchesKeyword && matchesMin && matchesMax && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      const diff = a.price - b.price;
      return query.sort === 'PRICE_ASC' ? diff : -diff;
    });

    const total = sorted.length;
    const start = (pageIndex - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);

    return of({ items, total }).pipe(delay(300));
  }
}
