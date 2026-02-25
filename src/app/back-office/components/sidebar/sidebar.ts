import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';
import { SelectedShopStateService, SelectedShopContext } from '../../services/selected-shop-state.service';

type NavItem = {
  label: string;
  icon: string;      // material icon name
  route: any[];
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
})
export class Sidebar {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly selectedShopState = inject(SelectedShopStateService);

  @Output() logout = new EventEmitter<void>();

  readonly user$ = this.authState.currentUser$;
  readonly selectedShop$ = this.selectedShopState.selectedShop$;

  collapsed = false;
  search = '';

  toggle() {
    this.collapsed = !this.collapsed;
  }

  getBaseNav(): NavItem[] {
    return [{ label: 'My Shops', icon: 'storefront', route: ['/shop'] }];
  }

  getShopNav(selectedShop: SelectedShopContext): NavItem[] {
    const id = selectedShop._id;
    return [
      { label: 'Dashboard', icon: 'space_dashboard', route: ['/shop', id, 'dashboard'] },
      { label: 'Customers', icon: 'group', route: ['/shop', id, 'customers'] },
      { label: 'Products', icon: 'inventory_2', route: ['/shop', id, 'products'] },
      { label: 'Orders', icon: 'receipt_long', route: ['/shop', id, 'orders'] },
    ];
  }

  backToMyShops(): void {
    this.selectedShopState.clear();
    this.router.navigate(['/shop']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.session.resetCache(); // reset cache to force refresh of user info in guards and other parts of the app
        this.selectedShopState.clear();
        this.logout.emit();
        window.location.href = '/auth/login'; // full reload to reset any cached state, can be improved with a proper state management and route guards
      },
      error: (error: unknown) => {
        // even if logout API call fails, we still want to clear client state
        this.selectedShopState.clear();
        this.logout.emit();
      }
    });
  }
}
