import { Component, inject, input } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AsyncPipe } from '@angular/common';



@Component({
  selector: 'app-details-layout',
  imports: [
    AsyncPipe,
    NavbarComponent,
  ],
  templateUrl: './details-layout.html',
  styleUrl: './details-layout.css',
})
export class DetailsLayout {
  private readonly authState = inject(AuthStateService);
  readonly currentUser$ = this.authState.currentUser$;

    onLogout(): void {
    this.authState.logout();
  }

}
