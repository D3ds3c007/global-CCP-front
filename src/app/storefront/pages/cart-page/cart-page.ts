import { Component,inject } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import {CartComponent} from "../../components/cart-component/cart-component"
import { CheckoutHeaderComponent } from '../../components/checkout-header/checkout-header';



@Component({
  selector: 'app-cart-page',
  imports: [
    DetailsLayout,
    CartComponent,
    CheckoutHeaderComponent
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {

}
