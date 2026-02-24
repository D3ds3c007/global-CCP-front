import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card.html',
  styleUrls: ['./dashboard-card.css'],
})
export class DashboardCardComponent {
  @Input() title = '';
}