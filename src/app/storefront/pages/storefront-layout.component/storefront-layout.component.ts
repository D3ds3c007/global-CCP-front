import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { AuthStateService } from '../../../core/services/auth-state.service';
import { SearchQuery } from '../../services/product.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AdvancedSearchPanelComponent } from '../../components/advanced-search/advanced-search-panel.component';
import { StorefrontStateService  } from '../../services/store-front-state';

@Component({
  selector: 'app-storefront-layout',
  imports: [
    AsyncPipe,
    NavbarComponent,
    AdvancedSearchPanelComponent
],
  templateUrl: './storefront-layout.component.html',
  styleUrl: './storefront-layout.component.css',
})
export class StorefrontLayoutComponent {
  private readonly authState = inject(AuthStateService);
  readonly state = inject(StorefrontStateService );
  readonly currentUser$ = this.authState.currentUser$;
  readonly categories$ = this.state.categories$;
  readonly query = this.state.query;

  onLogout(): void {
    this.authState.logout();
  }

  onQueryChange(query: SearchQuery): void {
    this.state.onQueryChange(query);
  }

  onClearFilters(): void {
    this.state.onClearFilters();
  }

}
