import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AuthFormLayoutComponent } from '../../components/auth-form-layout/auth-form-layout.component';
import { EmailInputComponent } from '../../../shared/components/inputs/email-input/email-input.component';
import { PasswordInputComponent } from '../../../shared/components/inputs/password-input/password-input.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { SubmitButtonComponent } from '../../../shared/components/buttons/submit-button/submit-button.component';

type LoginFormGroup = {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
};

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthFormLayoutComponent,
    EmailInputComponent,
    PasswordInputComponent,
    FormErrorComponent,
    SubmitButtonComponent
  ]
})
export class LoginPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly submitted = signal(false);

  readonly form: FormGroup<LoginFormGroup> = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this.fb.control(false)
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value
    };

    this.authService
      .login(payload)
      .pipe(
        take(1),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: result => console.log('Login success', result),
        error: error => console.error('Login error', error)
      });
  }

  isInvalid(controlName: keyof LoginFormGroup): boolean {
    const control = this.form.controls[controlName];
    return (control.touched || this.submitted()) && control.invalid;
  }

  isSubmitDisabled(): boolean {
    return this.form.invalid || this.loading();
  }
}
