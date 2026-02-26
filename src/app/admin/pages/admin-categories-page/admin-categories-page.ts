import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import {
  AdminCategoriesBackService,
  Category,
  CategoryMutationResponse,
} from '../../services/admin-categories-back';
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
export class AdminCategoriesPage implements OnInit {
  private service = inject(AdminCategoriesBackService);
  vm$ = this.service.vm$;

  dialogOpen = false;
  dialogMode: CategoryDialogMode = 'create';
  editing?: Category;

  ngOnInit(): void {
    this.service.listCategories().subscribe({
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

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
    const request$ = e.mode === 'create' ? this.service.create(e.value) : this.service.update(e.id!, e.value);
    request$.subscribe({
      next: () => this.closeDialog(),
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

  toggle(id: string) {
    this.service.toggleStatus(id).subscribe({
      next: (res: CategoryMutationResponse) => {
        if (res.message) this.alertMessage(res.message);
      },
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

  private alertMessage(message: string) {
    if (!message || typeof window === 'undefined') return;
    window.alert(message);
  }
}
