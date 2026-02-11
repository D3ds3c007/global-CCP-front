import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-top-products-section',
  templateUrl: './top-products-section.component.html',
  styleUrl: './top-products-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent]
})
export class TopProductsSectionComponent {
  readonly products = input<Product[]>([]);
  readonly addingProductId = input<string | null>(null);
  readonly addedProductId = input<string | null>(null);
  readonly addToCart = output<string>();

  onAddToCart(productId: string): void {
    this.addToCart.emit(productId);
  }
}
