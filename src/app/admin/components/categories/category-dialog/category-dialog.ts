import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Category, CategoryStatus, CategoryType } from '../../../services/admin-categories-back';

export type CategoryDialogMode = 'create' | 'edit';

export type CategoryDialogSave = {
  mode: CategoryDialogMode;
  id?: string;
  value: Omit<Category, 'id'>;
};

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-dialog.html',
  styleUrls: ['./category-dialog.css'],
})
export class CategoryDialogComponent implements OnChanges {
  @Input({ required: true }) mode!: CategoryDialogMode;
  @Input() category?: Category;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<CategoryDialogSave>();

  private fb = inject(FormBuilder);

  // form: status est un booléen pour le toggle
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['SHOP' as CategoryType, [Validators.required]],
    active: [true, [Validators.required]],
  });

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.category) {
      this.form.setValue({
        name: this.category.name,
        type: this.category.type,
        active: this.category.status === 'active',
      });
      return;
    }

    // create defaults
    if (this.mode === 'create') {
      this.form.reset({
        name: '',
        type: 'SHOP',
        active: true,
      });
    }
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const status: CategoryStatus = raw.active ? 'active' : 'inactive';

    this.save.emit({
      mode: this.mode,
      id: this.category?.id,
      value: {
        name: raw.name,
        type: raw.type,
        status,
      },
    });
  }
}