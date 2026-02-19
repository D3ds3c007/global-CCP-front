import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage, CurrencyPipe } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { RouterLink } from '@angular/router';

import { Product } from '../../services/product.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NgOptimizedImage,
    CurrencyPipe,
    NzCardModule,
    NzButtonModule,
    NzTagModule]
})
export class ProductCardComponent {
  readonly product = input<Product | null>(null);
  readonly isAdding = input<boolean>(false);
  readonly justAdded = input<boolean>(false);
  readonly addToCart = output<string>();

  onAddToCart(): void {
    const product = this.product();
    if (product) {
      this.addToCart.emit(product.id);
    }
  }
}
