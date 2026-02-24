import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LowStockProduct } from '../../../services/dashboard-service'; // adapte le chemin si besoin

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './low-stock.html',
  styleUrls: ['./low-stock.css'],
})
export class LowStockComponent {
  @Input() products: LowStockProduct[] = [];
}