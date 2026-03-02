import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { take } from 'rxjs';

import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [AsyncPipe, RouterLink, NzButtonModule, NzIconModule],
  templateUrl: './floating-actions.component.html',
  styleUrl: './floating-actions.component.css',
})
export class FloatingActionsComponent {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly cartService = inject(CartService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly currentUser$ = this.authState.currentUser$;
  readonly cartCount$ = this.cartService.totalQuantity$;
  readonly isUserMenuOpen = signal(false);

  onLogout(): void {
    this.authService.logout().pipe(take(1)).subscribe({
      next: () => {
        this.session.resetCache();
        this.authState.logout();
        window.location.href = '/auth/login';
      },
      error: () => {
        this.session.resetCache();
        this.authState.logout();
      }
    });
  }

  openUserMenu(): void {
    this.isUserMenuOpen.set(true);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  onUserMenuFocusOut(event: FocusEvent): void {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && this.host.nativeElement.contains(nextTarget)) {
      return;
    }

    this.closeUserMenu();
  }
}
