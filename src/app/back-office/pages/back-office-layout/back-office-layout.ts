import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../../../auth/services/auth.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AuthSessionService } from '../../../auth/services/auth-session.service';

@Component({
  selector: 'app-back-office-layout',
  standalone: true,
  imports: [
    Sidebar,
    RouterOutlet
  ],
  templateUrl: './back-office-layout.html',
  styleUrls: ['./back-office-layout.css'],
})
export class BackOfficeLayout {
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authState.logout();
        this.authSession.resetCache();
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Logout error', err);
        // Clear state anyway
        this.authState.logout();
        this.authSession.resetCache();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}