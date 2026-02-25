import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Shop, ShopsBackService } from '../../../services/shop.service';

@Component({
  selector: 'app-shop-row',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-row.html',
  styleUrls: ['./shop-row.css'],
})
export class ShopRowComponent implements OnChanges {
  @Input({ required: true }) shop!: Shop;
  readonly apiUrl = inject(ShopsBackService)['apiUrl'];
  imageLoadFailed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['shop']) this.imageLoadFailed = false;
  }

  get isActive(): boolean {
    return (this.shop.status ?? '').toUpperCase() === 'ACTIVE';
  }

  get shopName(): string {
    return this.shop?.name?.trim() || 'Unnamed shop';
  }

  get categoryName(): string {
    return this.shop?.category?.name || (this.shop as any)?.categoryId || 'Unknown';
  }

  get logoSrc(): string | null {
    const raw = String(this.shop?.logoUrl ?? '').trim();
    if (!raw || this.imageLoadFailed) return null;
    if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
    return `${this.apiUrl}pictures/${raw}`;
  }

  get initials(): string {
    return this.shopName.charAt(0).toUpperCase();
  }

  onRowClick(event: MouseEvent): void {
    if (this.isActive) return;

    event.preventDefault();
    event.stopPropagation();
    window.alert('This shop is not active yet.');
  }

  onLogoError(): void {
    this.imageLoadFailed = true;
  }
}
