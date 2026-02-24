import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export type ProductStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  status: ProductStatus;
}

export interface ProductsQuery {
  search: string;
  categoryId: string | 'all';
  status: ProductStatus | 'all';
}

export interface ProductsKpis {
  processedOrdersPercent: number;
  pendingOrdersPercent: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsBackService {
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([
    { id: 'cat-it', name: 'IT' },
    { id: 'cat-construction', name: 'Construction' },
    { id: 'cat-logistics', name: 'Logistics' },
  ]);

  private readonly productsSubject = new BehaviorSubject<Product[]>(this.seedProducts());

  private readonly querySubject = new BehaviorSubject<ProductsQuery>({
    search: '',
    categoryId: 'all',
    status: 'all',
  });

  private readonly kpisSubject = new BehaviorSubject<ProductsKpis>({
    processedOrdersPercent: 15,
    pendingOrdersPercent: 4,
  });

  readonly categories$ = this.categoriesSubject.asObservable();
  readonly kpis$ = this.kpisSubject.asObservable();
  readonly query$ = this.querySubject.asObservable();

  readonly productsFiltered$ = combineLatest([this.productsSubject, this.querySubject]).pipe(
    map(([products, q]) => {
      const s = q.search.trim().toLowerCase();

      return products.filter((p) => {
        const matchSearch = !s || p.name.toLowerCase().includes(s);
        const matchCategory = q.categoryId === 'all' || p.categoryId === q.categoryId;
        const matchStatus = q.status === 'all' || p.status === q.status;

        return matchSearch && matchCategory && matchStatus;
      });
    })
  );

  readonly vm$ = combineLatest({
    kpis: this.kpis$,
    categories: this.categories$,
    query: this.query$,
    products: this.productsFiltered$,
  });

  setQuery(patch: Partial<ProductsQuery>) {
    this.querySubject.next({ ...this.querySubject.value, ...patch });
  }

  toggleActive(productId: string) {
    const next: Product[] = this.productsSubject.value.map((p) =>
      p.id === productId
        ? { ...p, status: (p.status === 'active' ? 'inactive' : 'active') as ProductStatus }
        : p
    );

    this.productsSubject.next(next);
  }

  create(product: Omit<Product, 'id'>) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'p-' + Date.now();

    const next: Product[] = [{ id, ...product }, ...this.productsSubject.value];
    this.productsSubject.next(next);
  }

  delete(productId: string) {
    const next: Product[] = this.productsSubject.value.filter((p) => p.id !== productId);
    this.productsSubject.next(next);
  }

  update(productId: string, patch: Partial<Product>) {
    const next: Product[] = this.productsSubject.value.map((p) =>
      p.id === productId ? ({ ...p, ...patch } as Product) : p
    );
    this.productsSubject.next(next);
  }

  private seedProducts(): Product[] {
    const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/380`;

    const data: Product[] = [
      { id: 'p1', imageUrl: img('pc'), name: 'Gaming Computer', price: 0, stock: 12, categoryId: 'cat-it', status: 'active' },
      { id: 'p2', imageUrl: img('scaffold'), name: 'Scaffold Service', price: 0, stock: 3, categoryId: 'cat-construction', status: 'active' },
      { id: 'p3', imageUrl: img('container'), name: 'Container Transport', price: 0, stock: 0, categoryId: 'cat-logistics', status: 'inactive' },
      { id: 'p4', imageUrl: img('keyboard'), name: 'Keyboard', price: 49, stock: 5, categoryId: 'cat-it', status: 'active' },
      { id: 'p5', imageUrl: img('mouse'), name: 'Mouse', price: 19, stock: 2, categoryId: 'cat-it', status: 'active' },
    ];

    return data;
  }
}