import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmitButtonComponent {
  readonly label = input<string>('Submit');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
