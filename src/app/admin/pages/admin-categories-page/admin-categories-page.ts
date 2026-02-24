import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { AdminCategoriesBackService, Category } from '../../services/admin-categories-back';
import { CategoriesFiltersComponent } from '../../components/categories/categories-filters/categories-filters';
import { CategoriesChipsComponent } from '../../components/categories/categories-chips/categories-chips';
import { CategoryDialogComponent, CategoryDialogMode, CategoryDialogSave } from '../../components/categories/category-dialog/category-dialog';

// réutilise ton DashboardCard existant
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    CategoriesFiltersComponent,
    CategoriesChipsComponent,
    CategoryDialogComponent,
  ],
  templateUrl: './admin-categories-page.html',
  styleUrls: ['./admin-categories-page.css'],
})
export class AdminCategoriesPage {
  private service = inject(AdminCategoriesBackService);
  vm$ = this.service.vm$;

  dialogOpen = false;
  dialogMode: CategoryDialogMode = 'create';
  editing?: Category;

  setQuery(patch: any) {
    this.service.setQuery(patch);
  }

  openCreate() {
    this.dialogMode = 'create';
    this.editing = undefined;
    this.dialogOpen = true;
  }

  openEdit(c: Category) {
    this.dialogMode = 'edit';
    this.editing = c;
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
  }

  onSave(e: CategoryDialogSave) {
    if (e.mode === 'create') this.service.create(e.value);
    else this.service.update(e.id!, e.value);

    this.closeDialog();
  }

  toggle(id: string) {
    this.service.toggleStatus(id);
  }
}