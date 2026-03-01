import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export type HeaderTab = {
  label: string;
  link: any[]; // routerLink
};

@Component({
  selector: 'app-checkout-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout-header.html',
  styleUrls: ['./checkout-header.css'],
})
export class CheckoutHeaderComponent {
  @Input() tabs: HeaderTab[] = [
    { label: 'Payment', link: ['/checkout'] },
    { label: 'Order', link: ['/order'] },
  ];
}