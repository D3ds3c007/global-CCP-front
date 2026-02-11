import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-price-range-filter',
  templateUrl: './price-range-filter.component.html',
  styleUrl: './price-range-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzInputModule]
})
export class PriceRangeFilterComponent {
  readonly minPrice = input<number | null>(null);
  readonly maxPrice = input<number | null>(null);
  readonly rangeChange = output<{ minPrice: number | null; maxPrice: number | null }>();

  onMinInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.rangeChange.emit({
      minPrice: value === '' ? null : Number(value),
      maxPrice: this.maxPrice()
    });
  }

  onMaxInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.rangeChange.emit({
      minPrice: this.minPrice(),
      maxPrice: value === '' ? null : Number(value)
    });
  }
}
