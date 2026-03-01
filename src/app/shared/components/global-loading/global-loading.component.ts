import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  imports: [AsyncPipe, NgIf],
  templateUrl: './global-loading.component.html',
  styleUrl: './global-loading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalLoadingComponent {
  protected readonly loading$ = inject(LoadingService).loading$;
}
