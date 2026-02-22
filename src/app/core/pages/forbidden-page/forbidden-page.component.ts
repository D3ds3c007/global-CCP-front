import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-forbidden-page',
  imports: [NzCardModule, RouterLink],
  templateUrl: './forbidden-page.component.html',
  styleUrl: './forbidden-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForbiddenPageComponent {}
