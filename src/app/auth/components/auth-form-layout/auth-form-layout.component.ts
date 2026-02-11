import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-auth-form-layout',
  templateUrl: './auth-form-layout.component.html',
  styleUrl: './auth-form-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzCardModule]
})
export class AuthFormLayoutComponent {
  readonly title = input<string>('Welcome back');
  readonly subtitle = input<string>('Sign in to continue.');
  readonly titleId = input<string>('auth-title');
}
