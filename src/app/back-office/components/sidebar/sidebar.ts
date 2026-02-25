import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { SelectedShopContext, SelectedShopStateService } from '../../services/selected-shop-state.service';

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
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
})
export class Sidebar {
  private readonly authState = inject(AuthStateService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly selectedShopState = inject(SelectedShopStateService);

  @Output() logout = new EventEmitter<void>();
  @Input() brand = 'Golden Market';
  @Input() nav: NavItem[] = [];

  readonly user$ = this.authState.currentUser$;
  readonly selectedShop$ = this.selectedShopState.selectedShop$;
  readonly baseNav: NavItem[] = [{ kind: 'link', label: 'My Shops', icon: 'storefront', route: ['/shop'] }];
  readonly exactLinkActiveOptions = { exact: true };
  readonly shopNav$ = this.selectedShop$.pipe(
    map((selectedShop) => (selectedShop ? this.buildShopNav(selectedShop) : []))
  );

  collapsed = false;
  search = '';

  isLink(item: NavItem): item is NavLinkItem {
    return item.kind === 'link';
  }

  isDivider(item: NavItem): item is NavDividerItem {
    return item.kind === 'divider';
  }

  get hasCustomNav(): boolean {
    return this.nav.length > 0;
  }

  get filteredNav(): NavItem[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.nav;
    return this.nav.filter((item) => this.isDivider(item) || item.label.toLowerCase().includes(q));
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  backToMyShops(): void {
    this.selectedShopState.clear();
    this.router.navigate(['/shop']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.session.resetCache();
        this.selectedShopState.clear();
        this.logout.emit();
        window.location.href = '/auth/login';
      },
      error: (_error: unknown) => {
        this.selectedShopState.clear();
        this.logout.emit();
      },
    });
  }

  private buildShopNav(selectedShop: SelectedShopContext): NavItem[] {
    const id = selectedShop._id;
    return [
      { kind: 'link', label: 'Dashboard', icon: 'space_dashboard', route: ['/shop', id, 'dashboard'] },
      { kind: 'link', label: 'Customers', icon: 'group', route: ['/shop', id, 'customers'] },
      { kind: 'link', label: 'Products', icon: 'inventory_2', route: ['/shop', id, 'products'] },
      { kind: 'link', label: 'Orders', icon: 'receipt_long', route: ['/shop', id, 'orders'] },
    ];
  }
}
