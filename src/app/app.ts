import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from './auth/services/auth.service';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet
} from '@angular/router';
import { AuthStateService, User } from './core/services/auth-state.service';
import { catchError, of } from 'rxjs';
import { LoadingService } from './core/services/loading.service';
import { GlobalLoadingComponent } from './shared/components/global-loading/global-loading.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalLoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('global-repo-frontend');
  private readonly router = inject(Router);
  private readonly loading = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private auth: AuthService, private authState: AuthStateService) {}

  ngOnInit(): void {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading.startNavigation();
          return;
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.loading.endNavigation();
        }
      });

    this.auth.me().pipe(
      catchError(() => of(null))
    ).subscribe((res) => {
      if (!res?.user) {
        this.authState.setUser(null);
        return;
      }

      const user: User = {
        id: res.user.id,
        fullName: res.user.fullName,
        email: res.user.email,
        shops: res.user.shops ?? [],
      };

      this.authState.setUser(user);
    });
  }
}
