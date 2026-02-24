import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShopCategory, ShopStatus, Shop, ShopsBackService } from '../../../services/shop';
import { Subject, takeUntil, Observable } from 'rxjs';

export type ShopDialogMode = 'create';

export type ShopDialogSave = {
  mode: ShopDialogMode;
  value: Omit<Shop, '_id'>;
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
  @Output() save = new EventEmitter<ShopDialogSave>();

  private fb = inject(FormBuilder);
  
  readonly defaultLogoUrl = 'https://picsum.photos/seed/newshop/120/120';
  previewUrl = '';
  isDragOver = false;
  selectedLogoFileName = '';

  form = this.fb.nonNullable.group({
    _id: [''],
    ownerId: [''],
    logoUrl: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required]],
    categoryId: ['', [Validators.required]],
    status: ['PENDING' as ShopStatus, [Validators.required]],
    openingHours: ['', [Validators.required]],
    contact: this.fb.nonNullable.group({
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
    }),
    socials: this.fb.nonNullable.group({
      facebook: ['', [Validators.required]],
      instagram: ['', [Validators.required]],
      website: ['', [Validators.required]],
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
      { id: formValue.categoryId, name: formValue.categoryId };

    this.save.emit({
      mode: this.mode,
      value: {
        ownerId: formValue.ownerId,
        logoUrl: formValue.logoUrl,
        name: formValue.name,
        description: formValue.description,
        status: formValue.status,
        openingHours: formValue.openingHours,
        contact: {
          phone: formValue.contact.phone,
          email: formValue.contact.email,
          address: formValue.contact.address,
        },
        socials: {
          facebook: formValue.socials.facebook,
          instagram: formValue.socials.instagram,
          website: formValue.socials.website,
        },
        category: selectedCategory,
      } as Omit<Shop, '_id'>,
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
