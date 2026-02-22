import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { RouterOutlet } from '@angular/router';
import { AuthStateService, User } from './core/services/auth-state.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('global-repo-frontend');

  constructor(private auth: AuthService, private authState: AuthStateService) {}

   ngOnInit(): void {
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
