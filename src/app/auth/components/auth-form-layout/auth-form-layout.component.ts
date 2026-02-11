import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-form-layout',
  templateUrl: './auth-form-layout.component.html',
  styleUrl: './auth-form-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthFormLayoutComponent {
  readonly title = input<string>('Welcome back');
  readonly subtitle = input<string>('Sign in to continue.');
  readonly titleId = input<string>('auth-title');
}
