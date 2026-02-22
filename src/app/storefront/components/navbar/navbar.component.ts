import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {NzIconModule } from 'ng-zorro-antd/icon';
import { CartService } from '../../services/cart.service';

import { User } from '../../../core/services/auth-state.service';

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
  readonly cartCount$ = this.cartService.totalQuantity$;
  readonly brand = input<string>('Global Market');
  readonly user = input<User | null>(null);
  readonly logout = output<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
