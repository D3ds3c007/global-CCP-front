import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Shop, ShopsBackService } from '../../../services/shop.service';
import { SelectedShopStateService } from '../../../services/selected-shop-state.service';
import { env } from 'process';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-shop-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-row.html',
  styleUrls: ['./shop-row.css'],
})
export class ShopRowComponent implements OnChanges {
  @Input({ required: true }) shop!: Shop;
  readonly apiUrl = inject(ShopsBackService)['apiUrl'];
  readonly pictureUrl = environment.pictureUrl;
  private readonly router = inject(Router);
  private readonly selectedShopState = inject(SelectedShopStateService);
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
    return `${this.pictureUrl}logo/${raw}`;
  }

  get initials(): string {
    return this.shopName.charAt(0).toUpperCase();
  }

  onRowClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isActive) {
      this.selectedShopState.setFromShop(this.shop);
      this.router.navigate(['/shop', this.shop._id, 'dashboard']);
      return;
    }

    window.alert('This shop is not active yet.');
  }

  onLogoError(): void {
    this.imageLoadFailed = true;
  }
}
