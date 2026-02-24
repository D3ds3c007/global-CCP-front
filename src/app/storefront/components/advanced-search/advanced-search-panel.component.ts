import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

import { Category, SearchQuery, createDefaultSearchQuery } from '../../services/product.service';
import { SearchKeywordInputComponent } from './search-keyword-input/search-keyword-input.component';
import { PriceRangeFilterComponent } from './price-range-filter/price-range-filter.component';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { SortSelectComponent } from './sort-select/sort-select.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-advanced-search-panel',
  templateUrl: './advanced-search-panel.component.html',
  styleUrl: './advanced-search-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SearchKeywordInputComponent,
    PriceRangeFilterComponent,
    CategoryFilterComponent,
    SortSelectComponent,
    NzCardModule,
    NzButtonModule
  ]
})
export class AdvancedSearchPanelComponent {
  readonly categories = input<Category[]>([]);
  readonly query = input<SearchQuery>(createDefaultSearchQuery());
  readonly queryChange = output<SearchQuery>();
  readonly clearFilters = output<void>();

  readonly draft = signal<SearchQuery>(createDefaultSearchQuery());

  constructor() {
    effect(() => {
      this.draft.set(this.query());
    });
  }

  updateKeyword(value: string): void {
    this.draft.update(current => ({ ...current, keyword: value }));
  }

  updatePriceRange(range: { minPrice: number | null; maxPrice: number | null }): void {
    this.draft.update(current => ({
      ...current,
      minPrice: range.minPrice,
      maxPrice: range.maxPrice
    }));
  }

  updateCategories(categoryIds: string[]): void {
    this.draft.update(current => ({ ...current, categoryIds: [...categoryIds] }));
  }

  updateSort(sort: SearchQuery['sort']): void {
    this.draft.update(current => ({ ...current, sort }));
  }

  applyFilters(): void {
    this.queryChange.emit({ ...this.draft() });
  }

  clearAll(): void {
    this.draft.set(createDefaultSearchQuery());
    this.queryChange.emit(createDefaultSearchQuery());
    this.clearFilters.emit();
  }
}
