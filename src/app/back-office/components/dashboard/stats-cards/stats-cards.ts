import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type OrderStats = {
  PENDING: number;
  confirmed: number;
  delivered: number;
};

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.html',
  styleUrls: ['./stats-cards.css'], // adapte si ton fichier css/scss a un autre nom
})
export class StatsCardsComponent {
  @Input({ required: true }) stats!: OrderStats;
}