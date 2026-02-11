import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  readonly pageIndex = input<number>(1);
  readonly pageSize = input<number>(12);
  readonly totalItems = input<number>(0);
  readonly pageChange = output<number>();

  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize()));
  }

  pages(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.pageIndex()) {
      this.pageChange.emit(page);
    }
  }
}
