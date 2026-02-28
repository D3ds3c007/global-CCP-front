import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-commission-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comission-dialog.html',
  styleUrls: ['./comission-dialog.css'],
})
export class ComissionDialogComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    name: string;
    thresholdEur: number;
    fixedUnderUsd: number;
    percentAbove: number;
    activateNow: boolean;
  }>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    thresholdEur: [500, [Validators.required, Validators.min(0)]],
    fixedUnderUsd: [1, [Validators.required, Validators.min(0)]],
    percentAbove: [3, [Validators.required, Validators.min(0)]],
    activateNow: [true],
  });

  onBackdropClick() {
    this.cancel.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save.emit(this.form.getRawValue());
  }
}