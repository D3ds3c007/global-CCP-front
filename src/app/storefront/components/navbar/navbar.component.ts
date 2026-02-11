import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { User } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NzButtonModule]
})
export class NavbarComponent {
  readonly brand = input<string>('Global Market');
  readonly user = input<User | null>(null);
  readonly logout = output<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
