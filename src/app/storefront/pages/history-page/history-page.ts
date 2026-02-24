import { Component } from '@angular/core';
import { DetailsLayout } from '../details-layout/details-layout';
import { HistoryComponent } from '../../components/history/history';
import { CheckoutHeaderComponent } from '../../components/checkout-header/checkout-header';

@Component({
  selector: 'app-history-page',
  imports: [
    DetailsLayout,
    HistoryComponent,
    CheckoutHeaderComponent
  ],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {

}
