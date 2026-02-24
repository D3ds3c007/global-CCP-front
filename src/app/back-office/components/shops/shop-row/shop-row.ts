import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Shop } from '../../../services/shop';

@Component({
  selector: 'app-shop-row',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shop-row.html',
  styleUrls: ['./shop-row.css'],
})
export class ShopRowComponent {
  @Input({ required: true }) shop!: Shop;
}