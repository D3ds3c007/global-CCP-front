import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopProduct } from '../../../services/dashboard-service';

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-products.html',
  styleUrls: ['./top-products.css'],
})
export class TopProductsComponent {
  @Input() products: TopProduct[] = [];

  get max(): number {
    return this.products?.length ? Math.max(...this.products.map((p) => p.valueK)) : 1;
  }

  width(p: TopProduct): string {
    return `${(p.valueK / this.max) * 100}%`;
  }

  trackByProduct(index: number, product: TopProduct & { _id?: string; id?: string }): string | number {
    return product.productId ?? product._id ?? product.id ?? product.name ?? index;
  }
}
