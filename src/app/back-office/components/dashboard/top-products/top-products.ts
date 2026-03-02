import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopProduct } from '../../../services/dashboard-service';

interface DonutSegmentVM {
  color: string;
  dasharray: string;
  dashoffset: number;
  share: number;
  valueK: number;
  name: string;
}

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-products.html',
  styleUrls: ['./top-products.css'],
})
export class TopProductsComponent {
  @Input() products: TopProduct[] = [];

  readonly size = 220;
  readonly radius = 70;
  readonly strokeWidth = 24;
  readonly circumference = 2 * Math.PI * this.radius;
  readonly trackColor = 'rgba(148, 163, 184, 0.16)';

  private readonly palette = ['#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#38bdf8'];

  get totalValue(): number {
    return this.products.reduce((sum, product) => sum + Math.max(product.valueK, 0), 0);
  }

  get topProduct(): TopProduct | null {
    if (!this.products.length) {
      return null;
    }

    return this.products.reduce((top, product) => (product.valueK > top.valueK ? product : top));
  }

  get segments(): DonutSegmentVM[] {
    if (this.totalValue <= 0) {
      return [];
    }

    let offset = 0;

    return this.products
      .filter((product) => product.valueK > 0)
      .map((product, index) => {
        const share = product.valueK / this.totalValue;
        const length = share * this.circumference;
        const segment: DonutSegmentVM = {
          color: this.palette[index % this.palette.length],
          dasharray: `${length} ${this.circumference - length}`,
          dashoffset: -offset,
          share,
          valueK: product.valueK,
          name: product.name,
        };

        offset += length;
        return segment;
      });
  }

  get topProductShare(): number {
    if (!this.topProduct || this.totalValue <= 0) {
      return 0;
    }

    return this.topProduct.valueK / this.totalValue;
  }

  formatValueK(value: number): string {
    const rounded = Math.round(value * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}K`;
  }

  formatPercent(share: number): string {
    const percent = share * 100;
    return percent >= 10 ? `${Math.round(percent)}%` : `${percent.toFixed(1)}%`;
  }

  legendColor(index: number): string {
    return this.palette[index % this.palette.length];
  }

  trackByProduct(index: number, product: TopProduct & { _id?: string; id?: string }): string | number {
    return product.productId ?? product._id ?? product.id ?? product.name ?? index;
  }
}
