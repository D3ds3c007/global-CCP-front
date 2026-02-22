import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { TopProductsSectionComponent } from '../../components/top-products-section/top-products-section.component';
import { ProductGridComponent } from '../../components/product-grid/product-grid.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { StorefrontLayoutComponent } from "../storefront-layout.component/storefront-layout.component";
import { StorefrontStateService  } from '../../services/store-front-state';

@Component({
  selector: 'app-storefront-page',
  templateUrl: './storefront-page.component.html',
  styleUrl: './storefront-page.component.css',
  providers: [StorefrontStateService ],
  imports: [
    AsyncPipe,
    TopProductsSectionComponent,
    ProductGridComponent,
    PaginationComponent,
    StorefrontLayoutComponent,
]
})
export class StorefrontPageComponent {
  readonly state = inject(StorefrontStateService );
}
