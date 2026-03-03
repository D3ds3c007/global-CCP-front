import { Component } from '@angular/core';

@Component({
  selector: 'app-storefront-footer',
  standalone: true,
  templateUrl: './storefront-footer.component.html',
  styleUrl: './storefront-footer.component.css',
})
export class StorefrontFooterComponent {
  readonly developers = [
    'ETU2217 - Fy-Tahiana Ratsimbazafy',
    'ETU2231 - Princy Robinson',
  ];
}
