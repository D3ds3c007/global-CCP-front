import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopsService } from '../../services/shop';
import { ShopRowComponent } from '../../components/shops/shop-row/shop-row';

@Component({
  selector: 'app-shops-list-page',
  standalone: true,
  imports: [CommonModule, ShopRowComponent],
  templateUrl: './shops-list-page.html',
  styleUrls: ['./shops-list-page.css'],
})
export class ShopsListPage {
  private shopsService = inject(ShopsService);
  shops$ = this.shopsService.listShops();
}