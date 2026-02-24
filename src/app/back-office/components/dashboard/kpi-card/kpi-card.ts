import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCard } from '../../../services/dashboard-service';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.html',
  styleUrls: ['./kpi-card.css'],
})
export class KpiCardComponent {
  @Input() data!: KpiCard;
}