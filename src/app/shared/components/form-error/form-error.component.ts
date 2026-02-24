import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormErrorComponent {
  readonly errors = input<ValidationErrors | null>(null);
  readonly touched = input<boolean>(false);
  readonly submitted = input<boolean>(false);

  shouldShow(): boolean {
    return (this.touched() || this.submitted()) && !!this.errors();
  }

  message(): string {
    const errors = this.errors();
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'This field is required.';
    }

    if (errors['email']) {
      return 'Enter a valid email address.';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength as number;
      return `Use at least ${requiredLength} characters.`;
    }

    if (errors['pattern']) {
      return 'Use a valid format.';
    }

    return 'Invalid value.';
  }
}
