import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Product } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent]
})
export class ProductGridComponent {
  readonly products = input<Product[]>([]);
  readonly emptyMessage = input<string>('No products found.');
  readonly addingProductId = input<string | null>(null);
  readonly addedProductId = input<string | null>(null);
  readonly addToCart = output<string>();

  onAddToCart(productId: string): void {
    this.addToCart.emit(productId);
  }
}
