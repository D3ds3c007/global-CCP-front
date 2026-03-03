import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { SearchQuery } from '../../services/product.service';
import { AdvancedSearchPanelComponent } from '../../components/advanced-search/advanced-search-panel.component';
import { StorefrontStateService  } from '../../services/store-front-state';
import { FloatingActionsComponent } from '../../components/floating-actions/floating-actions.component';
import { StorefrontFooterComponent } from '../../components/storefront-footer/storefront-footer.component';

@Component({
  selector: 'app-storefront-layout',
  imports: [
    AsyncPipe,
    AdvancedSearchPanelComponent,
    FloatingActionsComponent,
    StorefrontFooterComponent
  ],
  templateUrl: './storefront-layout.component.html',
  styleUrl: './storefront-layout.component.css',
})
export class StorefrontLayoutComponent {
  readonly state = inject(StorefrontStateService);
  readonly categories$ = this.state.categories$;
  readonly query = this.state.query;

  onQueryChange(query: SearchQuery): void {
    this.state.onQueryChange(query);
  }

  onClearFilters(): void {
    this.state.onClearFilters();
  }
}
