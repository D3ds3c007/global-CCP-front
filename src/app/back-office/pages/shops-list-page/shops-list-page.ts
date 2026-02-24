import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopsBackService } from '../../services/shop'; // ✅
import { ShopRowComponent } from '../../components/shops/shop-row/shop-row';
import { ShopDialogComponent, ShopDialogSave } from '../../components/shops/shop-dialog/shop-dialog';

@Component({
  selector: 'app-shops-list-page',
  standalone: true,
  imports: [CommonModule, ShopRowComponent, ShopDialogComponent],
  templateUrl: './shops-list-page.html',
  styleUrls: ['./shops-list-page.css'],
})
export class ShopsListPage {
  private service = inject(ShopsBackService); // ✅

  vm$ = this.service.vm$;

  dialogOpen = false;

  openCreate() { this.dialogOpen = true; }
  closeDialog() { this.dialogOpen = false; }

  onSave(e: ShopDialogSave) {
    this.service.create(e.value); // ✅
    this.closeDialog();
  }
}