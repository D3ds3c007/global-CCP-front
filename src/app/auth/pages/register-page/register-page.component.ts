import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, Validators, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AuthFormLayoutComponent } from '../../components/auth-form-layout/auth-form-layout.component';
import { EmailInputComponent } from '../../../shared/components/inputs/email-input/email-input.component';
import { PasswordInputComponent } from '../../../shared/components/inputs/password-input/password-input.component';
import { TextInputComponent } from '../../../shared/components/inputs/text-input/text-input.component';
import { SelectInputComponent, SelectOption } from '../../../shared/components/inputs/select-input/select-input.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { SubmitButtonComponent } from '../../../shared/components/buttons/submit-button/submit-button.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';

type UserRole = 'BUYER' | 'SHOP';

type RegisterFormGroup = {
  role: FormControl<UserRole | ''>;
  fullName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthFormLayoutComponent,
    EmailInputComponent,
    PasswordInputComponent,
    TextInputComponent,
    SelectInputComponent,
    FormErrorComponent,
    SubmitButtonComponent,
    NzAlertModule
  ]
})
export class RegisterPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly apiError = signal<string | null>(null);

  readonly roleOptions: SelectOption[] = [
    { label: 'Buyer', value: 'BUYER' },
    { label: 'Shop owner', value: 'SHOP' }
  ];

  readonly form: FormGroup<RegisterFormGroup> = this.fb.group({
    role: this.fb.control<UserRole | ''>('', [Validators.required]),
    fullName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phone: this.fb.control('', [Validators.required, Validators.pattern(/^\+?\d{7,15}$/)]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)])
  });

  onSubmit(): void {
    this.submitted.set(true);
    this.apiError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload = {
      role: this.form.controls.role.value as UserRole,
      fullName: this.form.controls.fullName.value,
      email: this.form.controls.email.value,
      phone: this.form.controls.phone.value,
      password: this.form.controls.password.value
    };

    this.authService
      .register(payload)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: result => {
          window.alert('Registration successful! Please log in with your new account.');
          this.apiError.set(null);
          this.router.navigate(['/login']);
        },
        error: error => {
          console.error('Register error', error);
          this.apiError.set(this.getErrorMessage(error));
        }
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.error ?? 'Something went wrong. Please try again.';
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    return 'Something went wrong. Please try again.';
  }

  isInvalid(controlName: keyof RegisterFormGroup): boolean {
    const control = this.form.controls[controlName];
    return (control.touched || this.submitted()) && control.invalid;
  }

  isSubmitDisabled(): boolean {
    return this.form.invalid || this.loading();
  }
}
