import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { finalize, take } from 'rxjs/operators';

import { DetailsLayout } from '../details-layout/details-layout';
import { ProductDetailsComponent } from '../../components/product-detail-component/product-detail-component';
import { CartService } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [DetailsLayout, ProductDetailsComponent, NgIf, AsyncPipe],
  templateUrl: './product-detail-page.html',
})
export class ProductDetailsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly addingProductId = signal<string | null>(null);
  readonly addedProductId = signal<string | null>(null);

  readonly product$ = this.route.paramMap.pipe(
    map(pm => pm.get('id')),
    filter((id): id is string => !!id),
    switchMap(id => this.productService.getProductById(id))
  );

  onAddToCart(e: { productId: string; quantity: number }) {
    this.addingProductId.set(e.productId);

    this.cartService
      .addItem(e.productId, e.quantity)
      .pipe(
        take(1),
        finalize(() => this.addingProductId.set(null))
      )
      .subscribe({
        next: () => {
          this.addedProductId.set(e.productId);
          setTimeout(() => this.addedProductId.set(null), 1200);
        },
      });
  }

  trackByProductId(_i: number, p: Product) {
    return p.id;
  }
}
