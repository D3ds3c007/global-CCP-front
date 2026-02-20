import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';

import { DetailsLayout } from '../details-layout/details-layout';
import { ProductDetailsComponent } from '../../components/product-detail-component/product-detail-component';
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

  readonly product$ = this.route.paramMap.pipe(
    map(pm => pm.get('id')),
    filter((id): id is string => !!id),
    switchMap(id => this.productService.getProductById(id))
  );

  onAddToCart(e: { productId: string; quantity: number }) {
    // tu as déjà une méthode dans ton service
    this.productService.handleAddToCart(e);
  }

  trackByProductId(_i: number, p: Product) {
    return p.id;
  }
}