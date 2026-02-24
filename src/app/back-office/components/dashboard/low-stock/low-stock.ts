import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../services/dashboard-service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-stock.html',
  styleUrls: ['./low-stock.css'],
})
export class LowStockComponent {
  @Input() products: Product[] = [];
}