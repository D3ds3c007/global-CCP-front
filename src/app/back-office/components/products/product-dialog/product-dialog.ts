import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Category,
  Product,
  ProductDialogSubmit,
  ProductStatus,
  ProductUpsertPayload,
} from '../../../services/product-back';
import { environment } from '../../../../../environments/environment';

export type ProductDialogMode = 'create' | 'edit' | 'details';

export type ProductDialogSave = ProductDialogSubmit;

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-dialog.html',
  styleUrls: ['./product-dialog.css'],
})
export class ProductDialogComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) mode!: ProductDialogMode;
  @Input() product?: Product;
  @Input() categories: Category[] = [];
  @Input() submitting = false;
  @Input() loading = false;
  @Input() errorMessage: string | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ProductDialogSave>();
  @Output() editFromDetails = new EventEmitter<Product>();

  private readonly fb = inject(FormBuilder);
  readonly pictureUrl = environment.pictureUrl;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['', [Validators.required]],
    status: ['ACTIVE' as ProductStatus, [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''],
  });

  retainedImages: string[] = [];
  newImages: NewImageItem[] = [];
  detailsActiveImage = '';

  get isDetailsMode(): boolean {
    return this.mode === 'details';
  }

  get title(): string {
    if (this.mode === 'create') return 'Create product';
    if (this.mode === 'edit') return 'Edit product';
    return 'Product details';
  }

  get combinedImages(): string[] {
    return [...this.retainedImages, ...this.newImages.map((i) => i.previewUrl)];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['product']) {
      this.syncFromInputs();
    }

    if (changes['categories'] && this.mode === 'create' && !this.form.controls.categoryId.value) {
      const firstCat = this.categories[0]?.id ?? '';
      if (firstCat) this.form.controls.categoryId.setValue(firstCat);
    }
  }

  ngOnDestroy(): void {
    this.clearNewImages();
  }

  onBackdropClick(): void {
    if (this.submitting) return;
    this.cancel.emit();
  }

  onPickFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const previewUrl = URL.createObjectURL(file);
      this.newImages.push({ file, previewUrl, name: file.name });
    }
    input.value = '';
  }

  removeExistingImage(index: number): void {
    this.retainedImages = this.retainedImages.filter((_, i) => i !== index);
    if (this.detailsActiveImage && !this.combinedImages.includes(this.detailsActiveImage)) {
      this.detailsActiveImage = this.combinedImages[0] ?? '';
    }
  }

  removeNewImage(index: number): void {
    const item = this.newImages[index];
    if (!item) return;
    URL.revokeObjectURL(item.previewUrl);
    this.newImages = this.newImages.filter((_, i) => i !== index);
    if (this.detailsActiveImage && !this.combinedImages.includes(this.detailsActiveImage)) {
      this.detailsActiveImage = this.combinedImages[0] ?? '';
    }
  }

  selectDetailsImage(url: string): void {
    this.detailsActiveImage = url;
  }

  openEditFromDetails(): void {
    if (!this.product) return;
    this.editFromDetails.emit(this.product);
  }

  onSubmit(): void {
    if (this.isDetailsMode || this.submitting) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ProductUpsertPayload = {
      name: raw.name.trim(),
      categoryId: raw.categoryId,
      status: raw.status,
      price: Number(raw.price),
      stock: Number(raw.stock),
      description: String(raw.description ?? '').trim(),
    };

    this.save.emit({
      mode: this.mode as 'create' | 'edit',
      id: this.product?._id || this.product?.id,
      payload,
      files: this.newImages.map((x) => x.file),
      retainedImages: [...this.retainedImages],
    });
  }

  private syncFromInputs(): void {
    this.clearNewImages();

    if (this.mode === 'create') {
      this.retainedImages = [];
      this.detailsActiveImage = '';
      this.form.reset({
        name: '',
        categoryId: this.categories[0]?.id ?? '',
        status: 'ACTIVE',
        price: 0,
        stock: 0,
        description: '',
      });
      return;
    }

    if (!this.product) return;

    this.retainedImages = [...(this.product.images ?? [])];
    this.detailsActiveImage = this.retainedImages[0] ?? this.product.imageUrl ?? '';
    this.form.reset({
      name: this.product.name ?? '',
      categoryId: this.product.categoryId ?? '',
      status: this.product.status ?? 'ACTIVE',
      price: Number(this.product.price ?? 0),
      stock: Number(this.product.stock ?? 0),
      description: this.product.description ?? '',
    });
  }

  private clearNewImages(): void {
    for (const img of this.newImages) URL.revokeObjectURL(img.previewUrl);
    this.newImages = [];
  }
}

interface NewImageItem {
  file: File;
  previewUrl: string;
  name: string;
}
