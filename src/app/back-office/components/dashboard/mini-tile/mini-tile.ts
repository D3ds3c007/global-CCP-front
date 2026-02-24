import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-tile.html',
  styleUrls: ['./mini-tile.css'],
})
export class MiniTileComponent {
  @Input() title = '';
}