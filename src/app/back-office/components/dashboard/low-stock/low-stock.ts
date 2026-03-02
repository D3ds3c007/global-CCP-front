import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LowStockProduct } from '../../../services/dashboard-service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-stock.html',
  styleUrls: ['./low-stock.css'],
})
export class LowStockComponent {
  @Input() products: LowStockProduct[] = [];

  get urgentCount(): number {
    return this.products.filter((product) => product.stock <= product.minStock * 0.5).length;
  }

  trackByProduct(index: number, product: LowStockProduct): string | number {
    return product.id ?? index;
  }

  stockRatio(product: LowStockProduct): number {
    if (product.minStock <= 0) {
      return 1;
    }

    return Math.max(0, Math.min(product.stock / product.minStock, 1));
  }

  severityLabel(product: LowStockProduct): string {
    if (product.stock <= product.minStock * 0.5) {
      return 'Critical';
    }

    if (product.stock <= product.minStock) {
      return 'Low';
    }

    return 'Stable';
  }

  shortage(product: LowStockProduct): number {
    return Math.max(product.minStock - product.stock, 0);
  }
}
