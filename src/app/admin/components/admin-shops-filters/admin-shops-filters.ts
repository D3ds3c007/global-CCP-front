import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopCategory, ShopsQuery } from '../../services/admin-shops-back';

@Component({
  selector: 'app-admin-shops-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-shops-filters.html',
  styleUrls: ['./admin-shops-filters.css'],
})
export class AdminShopsFiltersComponent {
  @Input({ required: true }) categories: ShopCategory[] = [];
  @Input({ required: true }) query!: ShopsQuery;

  @Output() queryChange = new EventEmitter<Partial<ShopsQuery>>();
}