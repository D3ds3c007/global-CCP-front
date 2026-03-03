import { Component } from '@angular/core';
import { FloatingActionsComponent } from '../../components/floating-actions/floating-actions.component';
import { StorefrontFooterComponent } from '../../components/storefront-footer/storefront-footer.component';

@Component({
  selector: 'app-details-layout',
  imports: [
    FloatingActionsComponent,
    StorefrontFooterComponent,
  ],
  templateUrl: './details-layout.html',
  styleUrl: './details-layout.css',
})
export class DetailsLayout {}
