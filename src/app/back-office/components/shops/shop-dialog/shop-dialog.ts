import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CreateShopPayload, ShopCategory, ShopStatus, Shop, ShopsBackService } from '../../../services/shop.service';
import { Subject, takeUntil, Observable, finalize } from 'rxjs';

export type ShopDialogMode = 'create';

export type ShopDialogSave = {
  mode: ShopDialogMode;
  value: CreateShopPayload;
};

@Component({
  selector: 'app-shop-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shop-dialog.html',
  styleUrls: ['./shop-dialog.css'],
})
export class ShopDialogComponent implements OnInit, OnChanges, OnDestroy {

  private readonly shopService = inject(ShopsBackService);
  readonly categories$: Observable<ShopCategory[]> = this.shopService.loadCategories();

  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) mode!: ShopDialogMode; // ici: "create"
  @Input() categories: ShopCategory[] = []; // à fournir par le parent pour éviter de s'abonner dans ce composant

  @Output() cancel = new EventEmitter<void>();
  @Output() created = new EventEmitter<Shop>();

  private fb = inject(FormBuilder);
  
  readonly defaultLogoUrl = 'https://picsum.photos/seed/newshop/120/120';
  previewUrl = '';
  isDragOver = false;
  selectedLogoFileName = '';
  private selectedLogoFile: File | null = null;
  submitting = false;
  submitError = '';

  form = this.fb.nonNullable.group({
    _id: [''],
    ownerId: [''],
    logoUrl: [''],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    categoryId: ['', [Validators.required]],
    status: ['PENDING' as ShopStatus, [Validators.required]],
    openingHours: [''],
    contact: this.fb.nonNullable.group({
      phone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      address: [''],
    }),
    socials: this.fb.nonNullable.group({
      facebook: [''],
      instagram: [''],
      website: [''],
    }),
  });
  ngOnInit(): void {
    this.categories$
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (cats) => {
        console.log('Categories emitted:', cats);
        this.categories = cats ?? []; // safe fallback
        
        this.ensureValidCategorySelection();
      },
      error: (err) => {
        console.error('loadCategories error:', err);
        this.categories = [];
      }
    });

    
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ShopDialogComponent categories input changed:', this.categories);

    if (changes['categories'] && !changes['mode']) {
      this.ensureValidCategorySelection();
      return;
    }

    const firstCat = (this.categories ?? [])[0]?._id ?? '';

    console.log('ShopDialogComponent initializing form with first category ID:', firstCat);

    this.form.reset({
      _id: '',
      ownerId: '',
      logoUrl: this.defaultLogoUrl,
      name: '',
      description: '',
      categoryId: firstCat,
      status: 'PENDING',
      openingHours: '',
      contact: {
        phone: '',
        email: '',
        address: '',
      },
      socials: {
        facebook: '',
        instagram: '',
        website: '',
      },
    });

    this.previewUrl = this.defaultLogoUrl;
    this.isDragOver = false;
    this.selectedLogoFileName = '';
    this.selectedLogoFile = null;
    this.submitting = false;
    this.submitError = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBackdropClick() {
    this.cancel.emit();
  }

  onPickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    this.processLogoFile(file, input);
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragOver = false;
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.isDragOver = false;

    const file = ev.dataTransfer?.files?.[0] ?? null;
    if (!file) return;

    this.processLogoFile(file);
  }

  onRemoveLogo(): void {
    this.selectedLogoFile = null;
    this.setLogo(this.defaultLogoUrl);
  }

  get hasCustomLogo(): boolean {
    return this.form.controls.logoUrl.value !== this.defaultLogoUrl;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const selectedCategory =
      this.categories.find(cat => cat._id === formValue.categoryId) ??
      { _id: formValue.categoryId, name: formValue.categoryId, isActive: true, createdAt: '', updatedAt: '' };

    const payload: CreateShopPayload = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      categoryId: formValue.categoryId,
      categoryName: selectedCategory.name,
      openingHours: formValue.openingHours.trim(),
      phone: formValue.contact.phone.trim(),
      email: formValue.contact.email.trim(),
      address: formValue.contact.address.trim(),
      facebook: formValue.socials.facebook.trim(),
      instagram: formValue.socials.instagram.trim(),
      website: formValue.socials.website.trim(),
      logoFile: this.selectedLogoFile,
    };

    this.submitError = '';
    this.submitting = true;

    this.shopService.createShop(payload)
      .pipe(finalize(() => { this.submitting = false; }))
      .subscribe({
        next: (shop) => this.created.emit(shop),
        error: (err) => {
          this.submitError =
            err?.error?.error ||
            err?.error?.message ||
            err?.error?.details ||
            'Failed to create shop.';
        }
      });
  }

  private processLogoFile(file: File, input?: HTMLInputElement): void {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez choisir une image.');
      if (input) input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image trop grande (max 2MB).');
      if (input) input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      this.selectedLogoFile = file;
      this.setLogo(dataUrl, file.name);
      if (input) input.value = '';
    };
    reader.readAsDataURL(file);
  }

  private setLogo(value: string, fileName = ''): void {
    this.previewUrl = value;
    this.form.controls.logoUrl.setValue(value);
    this.selectedLogoFileName = fileName;
  }

  private ensureValidCategorySelection(): void {
    const categories = this.categories ?? [];
    const currentCategoryId = this.form.controls.categoryId.value;
    // Set the default selection to the first category if the current one is not in the list anymore
    const hasCurrentCategory = categories.some(cat => cat._id === currentCategoryId);

    if (!hasCurrentCategory) {
      this.form.controls.categoryId.setValue(categories[0]?._id ?? '');
    }
  }
}
