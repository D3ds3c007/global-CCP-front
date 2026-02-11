import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzButtonModule]
})
export class SubmitButtonComponent {
  readonly label = input<string>('Submit');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
