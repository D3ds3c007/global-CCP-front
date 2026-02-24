import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShopCategory, ShopStatus, Shop } from '../../../services/shop';

export type ShopDialogMode = 'create';

export type ShopDialogSave = {
  mode: ShopDialogMode;
  value: Omit<Shop, 'id'>;
};

@Component({
  selector: 'app-shop-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop-dialog.html',
  styleUrls: ['./shop-dialog.css'],
})
export class ShopDialogComponent implements OnChanges {
  @Input({ required: true }) mode!: ShopDialogMode; // ici: "create"
  @Input() categories: ShopCategory[] = [];

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<ShopDialogSave>();

  private fb = inject(FormBuilder);

  previewUrl = '';

  form = this.fb.nonNullable.group({
    logoUrl: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['', [Validators.required]],
    status: ['pending' as ShopStatus, [Validators.required]],
  });

  ngOnChanges(): void {
    // defaults create
    const firstCat = this.categories[0]?.id ?? '';
    const defaultLogo = 'https://picsum.photos/seed/newshop/120/120';

    this.form.reset({
      logoUrl: defaultLogo,
      name: '',
      categoryId: firstCat,
      status: 'pending',
    });

    this.previewUrl = defaultLogo;
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  onPickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

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

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      this.previewUrl = dataUrl;
      this.form.controls.logoUrl.setValue(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit({
      mode: this.mode,
      value: this.form.getRawValue(),
    });
  }
}