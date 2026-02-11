import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-search-keyword-input',
  templateUrl: './search-keyword-input.component.html',
  styleUrl: './search-keyword-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzInputModule]
})
export class SearchKeywordInputComponent {
  readonly label = input<string>('Keyword');
  readonly placeholder = input<string>('Search products');
  readonly value = input<string>('');
  readonly id = input<string>('search-keyword');
  readonly valueChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
