import { Component } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import { OrderComponent } from '../../components/order/order';
import { CheckoutHeaderComponent } from '../../components/checkout-header/checkout-header';

@Component({
  selector: 'app-order-page',
  imports: [
    DetailsLayout,
    OrderComponent,
    CheckoutHeaderComponent
  ],
  templateUrl: './order-page.html',
  styleUrl: './order-page.css',
})
export class OrderPage {

}
