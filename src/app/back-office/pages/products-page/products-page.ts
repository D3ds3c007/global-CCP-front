import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Product, ProductsBackService, ProductsQuery } from '../../services/product-back';
import { ProductsFiltersComponent } from '../../components/products/products-filters/products-filters';
import { ProductCardComponent } from '../../components/products/product-card/product-card';
import { ProductsTableComponent } from '../../components/products/products-table/products-table';
import {
  ProductDialogComponent,
  ProductDialogMode,
  ProductDialogSave,
} from '../../components/products/product-dialog/product-dialog';
import { SelectedShopStateService } from '../../services/selected-shop-state.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductsFiltersComponent,
    ProductCardComponent,
    ProductsTableComponent,
    ProductDialogComponent,
  ],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.css'],
})
export class ProductsPage implements OnInit {
  private readonly facade = inject(ProductsBackService);
  private readonly selectedShopState = inject(SelectedShopStateService);
  private readonly router = inject(Router);

  readonly vm$ = this.facade.vm$;

  dialogOpen = false;
  dialogMode: ProductDialogMode = 'create';
  editing?: Product;

  loading = false;
  errorMessage: string | null = null;
  noShopMessage: string | null = null;
  busyProductIds: string[] = [];
  private shopId: string | null = null;

  ngOnInit(): void {
    const shopId = this.selectedShopState.snapshot?._id?.trim() ?? '';

    if (!shopId) {
      this.noShopMessage = 'Please select a shop first.';
      this.router.navigate(['/shop']);
      return;
    }

    this.shopId = shopId;
    this.loadProducts(shopId);
  }

  openCreate() {
    this.dialogMode = 'create';
    this.editing = undefined;
    this.dialogOpen = true;
  }

  openEdit(p: Product) {
    this.dialogMode = 'edit';
    this.editing = p;
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
  }

  onDialogSave(e: ProductDialogSave) {
    if (e.mode === 'create') {
      this.facade.create(e.value);
    } else {
      this.facade.update(e.id!, e.value);
    }
    this.closeDialog();
  }

  onEdit(p: Product) {
    this.openEdit(p);
  }

  onAdd() {
    this.openCreate();
  }

  setQuery(patch: Partial<ProductsQuery>) {
    this.facade.setQuery(patch);
  }

  onToggle(p: Product) {
    const productId = p._id || p.id;
    if (!this.shopId || !productId || this.isBusy(productId)) return;

    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.setBusy(productId, true);
    this.errorMessage = null;

    this.facade.toggleStatus(productId, nextStatus, this.shopId).subscribe({
      error: (err) => {
        this.errorMessage = this.readError(err);
        this.setBusy(productId, false);
      },
      complete: () => this.setBusy(productId, false),
    });
  }

  onDelete(p: Product) {
    const productId = p._id || p.id;
    if (!this.shopId || !productId || this.isBusy(productId)) return;
    if (!confirm(`Supprimer "${p.name}" ?`)) return;

    this.setBusy(productId, true);
    this.errorMessage = null;

    this.facade.deleteProduct(productId, this.shopId).subscribe({
      error: (err) => {
        this.errorMessage = this.readError(err);
        this.setBusy(productId, false);
      },
      complete: () => this.setBusy(productId, false),
    });
  }

  trackByProductId = (_index: number, p: Product): string => p._id || p.id;

  isProductBusy(p: Product): boolean {
    return this.isBusy(p._id || p.id);
  }

  private loadProducts(shopId: string): void {
    this.loading = true;
    this.errorMessage = null;

    this.facade.loadProducts(shopId).subscribe({
      error: (err) => {
        this.loading = false;
        this.errorMessage = this.readError(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private isBusy(productId: string): boolean {
    return this.busyProductIds.includes(productId);
  }

  private setBusy(productId: string, busy: boolean): void {
    if (busy) {
      if (!this.busyProductIds.includes(productId)) {
        this.busyProductIds = [...this.busyProductIds, productId];
      }
      return;
    }

    this.busyProductIds = this.busyProductIds.filter((id) => id !== productId);
  }

  private readError(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null) {
      const maybeErr = err as { message?: string };
      return maybeErr.message || 'Products action failed';
    }
    return 'Products action failed';
  }
}
