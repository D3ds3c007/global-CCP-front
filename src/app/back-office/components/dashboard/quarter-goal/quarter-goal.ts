import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quarter-goal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quarter-goal.html',
  styleUrls: ['./quarter-goal.css'],
})
export class QuarterGoalComponent {
  @Input() percent = 0;

  private r = 70;                    // rayon utilisé dans le path
  private arcLen = Math.PI * this.r; // longueur demi-cercle

  get dashArray(): string {
    return `${this.arcLen} ${this.arcLen}`;
  }

  get dashOffset(): number {
    const p = Math.max(0, Math.min(100, this.percent));
    return this.arcLen * (1 - p / 100);
  }
}