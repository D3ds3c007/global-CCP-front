import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Category, Product, ProductStatus } from '../../../services/product-back';

export type ProductDialogMode = 'create' | 'edit';

export type ProductDialogSave = {
  mode: ProductDialogMode;
  id?: string;
  value: Omit<Product, 'id'>; // on garde imageUrl final ici
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

  /** fichier choisi (optionnel) */
  private selectedFile: File | null = null;

  /** preview affichée (URL ou base64) */
  previewUrl = '';

  form = this.fb.nonNullable.group({
    imageUrl: ['', [Validators.required]], // sera rempli par URL OU par base64 si upload
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

      this.previewUrl = this.product.imageUrl;
      this.selectedFile = null;
      return;
    }

    if (this.mode === 'create') {
      const firstCat = this.categories[0]?.id ?? '';
      const defaultUrl = 'https://picsum.photos/seed/new/600/380';

      this.form.reset({
        imageUrl: defaultUrl,
        name: '',
        price: 0,
        stock: 0,
        categoryId: firstCat,
        status: 'active',
      });

      this.previewUrl = defaultUrl;
      this.selectedFile = null;
    }
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  onPickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    // basic validation
    if (!file.type.startsWith('image/')) {
      alert('Veuillez choisir une image.');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop grande (max 2MB).');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    // simulation: convert to base64 and store in imageUrl
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      this.previewUrl = dataUrl;

      // important: on remplit imageUrl avec le base64 (pour que create/update garde l’image)
      this.form.controls.imageUrl.setValue(dataUrl);
      this.form.controls.imageUrl.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  clearFile() {
    this.selectedFile = null;
    // optionnel: remettre l'url actuelle du champ
    this.previewUrl = this.form.controls.imageUrl.value;
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