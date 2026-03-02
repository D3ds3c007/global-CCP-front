import { Component,inject } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import {CartComponent} from "../../components/cart-component/cart-component"



@Component({
  selector: 'app-cart-page',
  imports: [
    DetailsLayout,
    CartComponent
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {

}
