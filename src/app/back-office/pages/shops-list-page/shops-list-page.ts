import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Shop, ShopsBackService } from '../../services/shop.service';
import { ShopRowComponent } from '../../components/shops/shop-row/shop-row';
import { ShopDialogComponent } from '../../components/shops/shop-dialog/shop-dialog';

@Component({
  selector: 'app-shops-list-page',
  standalone: true,
  imports: [CommonModule, ShopRowComponent, ShopDialogComponent],
  templateUrl: './shops-list-page.html',
  styleUrls: ['./shops-list-page.css'],
})
export class ShopsListPage {
  private service = inject(ShopsBackService);

  vm$ = this.service.vm$;

  dialogOpen = false;

  openCreate() { this.dialogOpen = true; }
  closeDialog() { this.dialogOpen = false; }

  onCreated(_: Shop) {
    this.closeDialog();
  }
}
