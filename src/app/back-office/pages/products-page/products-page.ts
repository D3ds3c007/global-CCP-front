import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Product, ProductsBackService, ProductsQuery } from '../../services/product-back';

// si tu as déjà tes composants KPI/dashboard, réutilise-les
import { DashboardCardComponent } from '../../components/dashboard/dashboard-card/dashboard-card';
import { KpiCardComponent } from '../../components/dashboard/kpi-card/kpi-card';

import { ProductsFiltersComponent } from '../../components/products/products-filters/products-filters';
import { ProductCardComponent } from '../../components/products/product-card/product-card';
import { ProductsTableComponent } from '../../components/products/products-table/products-table';
import { ProductDialogComponent, ProductDialogMode, ProductDialogSave } from '../../components/products/product-dialog/product-dialog';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    KpiCardComponent,
    ProductsFiltersComponent,
    ProductCardComponent,
    ProductsTableComponent,
    ProductDialogComponent,
  ],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.css'],
})
export class ProductsPage {
  private facade = inject(ProductsBackService);
  vm$ = this.facade.vm$;

  dialogOpen = false;
  dialogMode: ProductDialogMode = 'create';
  editing?: Product;

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

  // IMPORTANT: ton edit doit ouvrir le popup, pas faire un update direct
  onEdit(p: Product) {
    this.openEdit(p);
  }

  // ton bouton + doit ouvrir le popup create
  onAdd() {
    this.openCreate();
  }

  setQuery(patch: Partial<ProductsQuery>) {
    this.facade.setQuery(patch);
  }

  onToggle(p: any) {
    this.facade.toggleActive(p.id);
  }

  onDelete(p: any) {
    if (confirm(`Supprimer "${p.name}" ?`)) this.facade.delete(p.id);
  }
}