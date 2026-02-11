import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { Category } from '../../../services/product.service';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NzCheckboxModule]
})
export class CategoryFilterComponent {
  readonly categories = input<Category[]>([]);
  readonly selectedIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  toggleSelection(categoryId: string, checked: boolean): void {
    const current = this.selectedIds();
    const next = checked
      ? [...current, categoryId]
      : current.filter(id => id !== categoryId);

    this.selectionChange.emit(next);
  }
}
