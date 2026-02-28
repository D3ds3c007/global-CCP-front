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
  private readonly monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  hoveredIndex: number | null = null;

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

  labelFor(point: RevenuePoint): string | number {
    if (this.points.length === 12 && point.year >= 1 && point.year <= 12) {
      return this.monthLabels[point.year - 1];
    }
    return point.year;
  }

  showTooltip(index: number): void {
    this.hoveredIndex = index;
  }

  hideTooltip(): void {
    this.hoveredIndex = null;
  }

  tooltipX(index: number): number {
    const x = this.x(index);
    return Math.max(72, Math.min(this.w - 72, x));
  }

  tooltipY(index: number): number {
    const y = this.y(this.points[index]?.valueK ?? 0);
    return Math.max(24, y - 18);
  }

  tooltipLabel(point: RevenuePoint): string {
    return `${this.labelFor(point)}`;
  }

  tooltipValue(point: RevenuePoint): string {
    return `${point.valueK}K`;
  }
}
