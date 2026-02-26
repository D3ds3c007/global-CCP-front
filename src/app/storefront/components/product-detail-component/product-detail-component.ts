import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product.service';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './product-detail-component.html',
  styleUrls: ['./product-detail-component.css'],
})
export class ProductDetailsComponent {
  readonly pictureUrl = environment.pictureUrl;
  @Input({ required: true }) product!: Product;

  @Output() addToCart = new EventEmitter<{ productId: string; quantity: number }>();

  @ViewChild('scroller', { static: false }) scroller?: ElementRef<HTMLElement>;

  qty = 1;
  ACTIVEIndex = 0;

  get images(): string[] {
    const imgs = this.product?.images?.length ? this.product.images : [this.product.imageUrl];
    return imgs.filter(Boolean);
  }

  get isOutOfStock(): boolean {
    return (this.product?.stock ?? 0) <= 0;
  }

  get maxQty(): number {
    return Math.max(0, this.product?.stock ?? 0);
  }

  get total(): number {
    return (this.product?.price ?? 0) * (this.qty ?? 0);
  }

  clampQty(): void {
    if (this.isOutOfStock) {
      this.qty = 0;
      return;
    }
    if (!Number.isFinite(this.qty as any)) this.qty = 1;
    this.qty = Math.min(Math.max(1, this.qty), this.maxQty);
  }

  decQty(): void {
    this.qty = Math.max(1, (this.qty ?? 1) - 1);
  }

  incQty(): void {
    this.qty = Math.min(this.maxQty, (this.qty ?? 1) + 1);
  }

  onAddToCart(): void {
    this.clampQty();
    if (this.isOutOfStock) return;

    this.addToCart.emit({
      productId: this.product.id,
      quantity: this.qty,
    });
  }

  scrollTo(index: number): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const slides = el.querySelectorAll<HTMLElement>('.slide');
    const target = slides[index];
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    this.ACTIVEIndex = index;
  }

  prev(): void {
    const n = this.images.length;
    if (n <= 1) return;
    this.scrollTo((this.ACTIVEIndex - 1 + n) % n);
  }

  next(): void {
    const n = this.images.length;
    if (n <= 1) return;
    this.scrollTo((this.ACTIVEIndex + 1) % n);
  }

  onScrollerScroll(): void {
    const el = this.scroller?.nativeElement;
    if (!el) return;

    const w = el.clientWidth || 1;
    const idx = Math.round(el.scrollLeft / w);
    this.ACTIVEIndex = Math.max(0, Math.min(idx, this.images.length - 1));
  }

  trackByIndex = (i: number) => i;
}