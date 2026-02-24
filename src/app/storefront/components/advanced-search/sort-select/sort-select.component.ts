import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { SortOption } from '../../../services/product.service';

@Component({
  selector: 'app-sort-select',
  templateUrl: './sort-select.component.html',
  styleUrl: './sort-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NzSelectModule]
})
export class SortSelectComponent {
  readonly sort = input<SortOption>('PRICE_ASC');
  readonly sortChange = output<SortOption>();
}
