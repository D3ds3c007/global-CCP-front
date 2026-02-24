import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, ProductsQuery, ProductStatus } from '../../../services/product-back';

@Component({
  selector: 'app-products-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-filters.html',
  styleUrls: ['./products-filters.css'],
})
export class ProductsFiltersComponent implements OnChanges {
  @Input({ required: true }) categories: Category[] = [];
  @Input({ required: true }) query!: ProductsQuery;

  @Output() queryChange = new EventEmitter<Partial<ProductsQuery>>();

  // champs locaux (pour que la saisie marche toujours)
  search = '';
  categoryId: string | 'all' = 'all';
  status: ProductStatus | 'all' = 'all';

  ngOnChanges(): void {
    if (!this.query) return;
    this.search = this.query.search ?? '';
    this.categoryId = this.query.categoryId ?? 'all';
    this.status = this.query.status ?? 'all';
  }

  onSearch(v: string) {
    this.queryChange.emit({ search: v });
  }

  onCategory(v: string) {
    this.queryChange.emit({ categoryId: v as any });
  }

  onStatus(v: string) {
    this.queryChange.emit({ status: v as any });
  }
}