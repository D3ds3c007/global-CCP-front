import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../../services/product-back';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-products-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './products-table.html',
  styleUrls: ['./products-table.css'],
})
export class ProductsTableComponent {
  @Input() products: Product[] = [];
  @Input() disabledIds: string[] = [];

  @Output() view = new EventEmitter<Product>();
  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();
  @Output() toggle = new EventEmitter<Product>();
  readonly pictureUrl = environment.pictureUrl;
  trackByProductId = (_index: number, p: Product): string => p._id || p.id;

  isDisabled(p: Product): boolean {
    const id = p._id || p.id;
    return this.disabledIds.includes(id);
  }
}
