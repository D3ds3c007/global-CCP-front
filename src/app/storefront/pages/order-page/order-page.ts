import { Component } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import { OrderComponent } from '../../components/order/order';

@Component({
  selector: 'app-order-page',
  imports: [
    DetailsLayout,
    OrderComponent
  ],
  templateUrl: './order-page.html',
  styleUrl: './order-page.css',
})
export class OrderPage {

}
