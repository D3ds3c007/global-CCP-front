import { Component } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import { CheckoutComponent } from '../../components/checkout-component/checkout-component';


@Component({
  selector: 'app-checkout-page',
  imports: [
    DetailsLayout,
    CheckoutComponent,
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
})
export class CheckoutPage {

}
