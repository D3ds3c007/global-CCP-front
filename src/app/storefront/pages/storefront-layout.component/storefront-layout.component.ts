import { Component, ElementRef, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { take } from 'rxjs';

import { AuthStateService } from '../../../core/services/auth-state.service';
import { SearchQuery } from '../../services/product.service';
import { AdvancedSearchPanelComponent } from '../../components/advanced-search/advanced-search-panel.component';
import { StorefrontStateService  } from '../../services/store-front-state';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

@Component({
  selector: 'app-storefront-layout',
  imports: [
    AsyncPipe,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    AdvancedSearchPanelComponent
  ],
  templateUrl: './storefront-layout.component.html',
  styleUrl: './storefront-layout.component.css',
})
export class StorefrontLayoutComponent {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly cartService = inject(CartService);
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly state = inject(StorefrontStateService);
  readonly currentUser$ = this.authState.currentUser$;
  readonly categories$ = this.state.categories$;
  readonly cartCount$ = this.cartService.totalQuantity$;
  readonly query = this.state.query;
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

  onQueryChange(query: SearchQuery): void {
    this.state.onQueryChange(query);
  }

  onClearFilters(): void {
    this.state.onClearFilters();
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
