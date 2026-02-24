import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../../../core/services/auth-state.service';

type NavItem = {
  label: string;
  icon: string;      // material icon name
  route?: string;
  children?: NavItem[];
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    RouterLinkActive
  ],
})
export class Sidebar {
  private readonly authState = inject(AuthStateService);

  @Output() logout = new EventEmitter<void>();

  readonly user$ = this.authState.currentUser$;

  collapsed = false;
  search = '';

  nav: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: '/owner/dashboard' },
    { label: 'Customers', icon: 'group', route: '/owner/customers' },
    { label: 'Products', icon: 'inventory_2', route: '/owner/products' },
    { label: 'Orders', icon: 'public', route: '/owner/orders' },
  ];

  toggle() {
    this.collapsed = !this.collapsed;
  }

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
