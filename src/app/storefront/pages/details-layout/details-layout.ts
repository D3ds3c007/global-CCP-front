import { Component } from '@angular/core';
import { FloatingActionsComponent } from '../../components/floating-actions/floating-actions.component';

@Component({
  selector: 'app-details-layout',
  imports: [
    FloatingActionsComponent,
  ],
  templateUrl: './details-layout.html',
  styleUrl: './details-layout.css',
})
export class DetailsLayout {}
