import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBuyer } from '../../../services/dashboard-service';

@Component({
  selector: 'app-top-buyer-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-buyer-tile.html',
  styleUrls: ['./top-buyer-tile.css'],
})
export class TopBuyerTileComponent {
  @Input() buyer!: TopBuyer;
}