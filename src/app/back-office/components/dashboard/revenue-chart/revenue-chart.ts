import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenuePoint } from '../../../services/dashboard-service';

interface RevenueBarVM {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  label: string | number;
}

interface RevenueTickVM {
  y: number;
  value: number;
  label: string;
}

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

  readonly w = 700;
  readonly h = 260;
  readonly padTop = 24;
  readonly padRight = 20;
  readonly padBottom = 46;
  readonly padLeft = 52;
  readonly tickCount = 4;
  readonly gradientId = 'revenue-bar-gradient';

  get chartLeft(): number {
    return this.padLeft;
  }

  get chartRight(): number {
    return this.w - this.padRight;
  }

  get chartTop(): number {
    return this.padTop;
  }

  get chartBottom(): number {
    return this.h - this.padBottom;
  }

  get chartWidth(): number {
    return this.chartRight - this.chartLeft;
  }

  get chartHeight(): number {
    return this.chartBottom - this.chartTop;
  }

  get maxY(): number {
    return Math.max(...this.points.map((point) => point.valueK), 1);
  }

  get bars(): RevenueBarVM[] {
    if (!this.points.length) {
      return [];
    }

    const slotWidth = this.chartWidth / this.points.length;
    const width = Math.max(18, Math.min(slotWidth * 0.62, 42));

    return this.points.map((point, index) => {
      const value = Math.max(point.valueK, 0);
      const height = this.maxY > 0 ? (value / this.maxY) * this.chartHeight : 0;
      const x = this.chartLeft + slotWidth * index + (slotWidth - width) / 2;
      const y = this.chartBottom - height;

      return {
        x,
        y,
        width,
        height,
        value: point.valueK,
        label: this.labelFor(point),
      };
    });
  }

  get yTicks(): RevenueTickVM[] {
    return Array.from({ length: this.tickCount + 1 }, (_, index) => {
      const ratio = index / this.tickCount;
      const value = this.maxY * (1 - ratio);

      return {
        y: this.chartTop + this.chartHeight * ratio,
        value,
        label: this.formatTick(value),
      };
    });
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
    const bar = this.bars[index];
    if (!bar) {
      return this.chartLeft;
    }

    const center = bar.x + bar.width / 2;
    return Math.max(90, Math.min(this.w - 90, center));
  }

  tooltipY(index: number): number {
    const bar = this.bars[index];
    if (!bar) {
      return this.chartTop;
    }

    return Math.max(30, bar.y - 18);
  }

  tooltipLabel(point: RevenuePoint): string {
    return String(this.labelFor(point));
  }

  tooltipValue(point: RevenuePoint): string {
    return `${this.formatValue(point.valueK)}K`;
  }

  barTitle(point: RevenuePoint): string {
    return `${this.tooltipLabel(point)}: ${this.tooltipValue(point)}`;
  }

  private formatTick(value: number): string {
    return `${this.formatValue(value)}K`;
  }

  private formatValue(value: number): string {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
}
