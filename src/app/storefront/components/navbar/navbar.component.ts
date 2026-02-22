import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {NzIconModule } from 'ng-zorro-antd/icon';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';

import { User } from '../../../core/services/auth-state.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    NzButtonModule,
    NzIconModule
  ]
})
export class NavbarComponent {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  readonly cartCount$ = this.cartService.totalQuantity$;
  readonly brand = input<string>('Global Market');
  readonly user = input<User | null>(null);
  readonly logout = output<void>();

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.session.resetCache(); // reset cache to force refresh of user info in guards and other parts of the app
        this.logout.emit();
        window.location.href = '/auth/login'; // full reload to reset any cached state, can be improved with a proper state management and route guards
      },
      error: error => {
        // even if logout API call fails, we still want to clear client state
        this.logout.emit();
      }
    });
  }
}
