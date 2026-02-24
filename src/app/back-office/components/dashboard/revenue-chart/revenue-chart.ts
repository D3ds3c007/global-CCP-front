import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenuePoint } from '../../../services/dashboard-service';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue-chart.html',
  styleUrls: ['./revenue-chart.css'],
})
export class RevenueChartComponent {
  @Input() points: RevenuePoint[] = [];

  w = 700;
  h = 240;
  pad = 40;

  get maxY(): number {
    return Math.max(...this.points.map(p => p.valueK), 1);
  }

  x(i: number): number {
    const n = Math.max(this.points.length - 1, 1);
    return this.pad + (i * (this.w - this.pad * 2)) / n;
  }

  y(v: number): number {
    const usable = this.h - this.pad * 2;
    return this.h - this.pad - (v / this.maxY) * usable;
  }

  get polyline(): string {
    return this.points.map((p, i) => `${this.x(i)},${this.y(p.valueK)}`).join(' ');
  }

  get areaPath(): string {
    if (!this.points.length) return '';
    const startX = this.x(0);
    const endX = this.x(this.points.length - 1);
    const baseY = this.h - this.pad;

    const line = this.points.map((p, i) => `${this.x(i)} ${this.y(p.valueK)}`).join(' L ');
    return `M ${startX} ${baseY} L ${line} L ${endX} ${baseY} Z`;
  }
}