import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';
import { SelectedShopStateService, SelectedShopContext } from '../../services/selected-shop-state.service';

export type NavLinkItem = {
  kind: 'link';
  label: string;
  icon: string;
  route: any[];
};

export type NavDividerItem = {
  kind: 'divider';
  label?: string;
};

export type NavItem = NavLinkItem | NavDividerItem;

@Component({
  selector: 'app-sidebar',
  standalone: true,
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

  @Input() brand = 'OrangeFarm';

  @Input() user = {
    name: 'Gustavo Xavier',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
  };

  @Input() nav: NavItem[] = [
    { kind: 'link', label: 'Dashboard', icon: 'space_dashboard', route: ['/owner', 'dashboard'] },
    { kind: 'link', label: 'Customers', icon: 'group', route: ['/owner', 'customers'] },
    { kind: 'link', label: 'Products', icon: 'inventory_2', route: ['/owner', 'products'] },
    { kind: 'link', label: 'Orders', icon: 'public', route: ['/owner', 'orders'] },
  ];

  // helpers pour le template (narrow union type)
  isLink(item: NavItem): item is NavLinkItem {
    return item.kind === 'link';
  }
  isDivider(item: NavItem): item is NavDividerItem {
    return item.kind === 'divider';
  }

  get filteredNav(): NavItem[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.nav;

    // filtre seulement les links
    return (this.nav.filter(this.isLink) as NavLinkItem[])
      .filter(l => l.label.toLowerCase().includes(q));
  }

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