import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule, Validators, FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { AuthFormLayoutComponent } from '../../components/auth-form-layout/auth-form-layout.component';
import { EmailInputComponent } from '../../../shared/components/inputs/email-input/email-input.component';
import { PasswordInputComponent } from '../../../shared/components/inputs/password-input/password-input.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { SubmitButtonComponent } from '../../../shared/components/buttons/submit-button/submit-button.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAlertModule } from 'ng-zorro-antd/alert';

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
    SubmitButtonComponent,
    NzCheckboxModule,
    NzAlertModule
  ]
})
export class LoginPageComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly apiError = signal<string | null>(null);
  

  readonly form: FormGroup<LoginFormGroup> = this.fb.group({
    email: this.fb.control('', [Validators.required, Validators.email]),
    password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
    rememberMe: this.fb.control(false)
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
        next: result => {
          console.log('Login success', result);
          this.apiError.set(null);
         //call authService.me() to get user info
            this.authService.me().subscribe({
              next: res => {
                
                console.log('Current user', res.user.role);
                if (res.user.role === 'SHOP') this.router.navigate(['/shop/dashboard']);
                else if (res.user.role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
                else this.router.navigate(['/']);
              },
              error: error => {
                console.error('Error fetching user info', error);
              }
            });
        },
        error: error => {
          console.error('Login error', error || error);
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

  isInvalid(controlName: keyof LoginFormGroup): boolean {
    const control = this.form.controls[controlName];
    return (control.touched || this.submitted()) && control.invalid;
  }

  isSubmitDisabled(): boolean {
    return this.form.invalid || this.loading();
  }
}
