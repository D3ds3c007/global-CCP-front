import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Shop, ShopsBackService } from '../../services/shop.service';
import { SelectedShopStateService } from '../../services/selected-shop-state.service';
import { ShopRowComponent } from '../../components/shops/shop-row/shop-row';
import { ShopDialogComponent } from '../../components/shops/shop-dialog/shop-dialog';

@Component({
  selector: 'app-shops-list-page',
  standalone: true,
  imports: [CommonModule, ShopRowComponent, ShopDialogComponent],
  templateUrl: './shops-list-page.html',
  styleUrls: ['./shops-list-page.css'],
})
export class ShopsListPage implements OnInit {
  private service = inject(ShopsBackService);
  private selectedShopState = inject(SelectedShopStateService);

  vm$ = this.service.vm$;

  dialogOpen = false;

  ngOnInit(): void {
    this.selectedShopState.clear();
  }

  openCreate() { this.dialogOpen = true; }
  closeDialog() { this.dialogOpen = false; }

  onCreated(_: Shop) {
    this.closeDialog();
  }
}
