import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryStatus, CategoryType, CategoriesQuery } from '../../../services/admin-categories-back';

@Component({
  selector: 'app-categories-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-filters.html',
  styleUrls: ['./categories-filters.css'],
})
export class CategoriesFiltersComponent {
  @Input({ required: true }) query!: CategoriesQuery;
  @Input() statuses: (CategoryStatus | 'all')[] = [];
  @Input() types: (CategoryType | 'all')[] = [];

  @Output() queryChange = new EventEmitter<Partial<CategoriesQuery>>();
}