import { Component, inject, Input } from '@angular/core';
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
export class ShopRowComponent {
  @Input({ required: true }) shop!: Shop;
  readonly apiUrl = inject(ShopsBackService)['apiUrl'];

  onRowClick(event: MouseEvent): void {
    if ((this.shop.status ?? '').toUpperCase() === 'ACTIVE') return;

    event.preventDefault();
    event.stopPropagation();
    window.alert('This shop is not active yet.');
  }
}
