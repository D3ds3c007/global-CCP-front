import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Category, Product, ProductStatus } from '../../../services/product-back';

export type ProductDialogMode = 'create' | 'edit';

export type ProductDialogSave = {
  mode: ProductDialogMode;
  id?: string;
  value: Omit<Product, 'id'>;
};

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-dialog.html',
  styleUrls: ['./product-dialog.css'],
})
export class ProductDialogComponent implements OnChanges {
  @Input({ required: true }) mode!: ProductDialogMode;
  @Input() product?: Product;
  @Input() categories: Category[] = [];

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ProductDialogSave>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    imageUrl: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', [Validators.required]],
    status: ['active' as ProductStatus, [Validators.required]],
  });

  ngOnChanges(): void {
    if (this.mode === 'edit' && this.product) {
      this.form.setValue({
        imageUrl: this.product.imageUrl,
        name: this.product.name,
        price: this.product.price,
        stock: this.product.stock,
        categoryId: this.product.categoryId,
        status: this.product.status,
      });
      return;
    }

    // mode create
    if (this.mode === 'create') {
      const firstCat = this.categories[0]?.id ?? '';
      this.form.reset({
        imageUrl: 'https://picsum.photos/seed/new/600/380',
        name: '',
        price: 0,
        stock: 0,
        categoryId: firstCat,
        status: 'active',
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

    const value = this.form.getRawValue();

    this.save.emit({
      mode: this.mode,
      id: this.product?.id,
      value,
    });
  }
}