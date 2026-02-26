import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../../services/product-back';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() actionsDisabled = false;

  @Output() view = new EventEmitter<Product>();
  @Output() edit = new EventEmitter<Product>();
  @Output() remove = new EventEmitter<Product>();
  @Output() toggle = new EventEmitter<Product>();
  readonly pictureUrl = environment.pictureUrl;
  get priceLabel(): string {
    return this.product.price === 0 ? 'FREE' : '';
  }
}
