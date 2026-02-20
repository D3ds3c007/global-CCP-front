import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {NzIconModule } from 'ng-zorro-antd/icon';

import { User } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    NzButtonModule,
    NzIconModule
  ]
})
export class NavbarComponent {
  // exemple: cartCount = computed(() => this.cartService.count());
  cartCount() { return 0; } // remplace par ta vraie logique
  readonly brand = input<string>('Global Market');
  readonly user = input<User | null>(null);
  readonly logout = output<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
