import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueChartComponent } from './revenue-chart';

describe('RevenueChartComponent', () => {
  let component: RevenueChartComponent;
  let fixture: ComponentFixture<RevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders empty state when there are no points', () => {
    component.points = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No revenue data.');
  });

  it('renders one bar per point', () => {
    component.points = [
      { year: 1, valueK: 12 },
      { year: 2, valueK: 18 },
      { year: 3, valueK: 9 },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.bar').length).toBe(3);
  });

  it('maps monthly labels when 12 points are provided', () => {
    component.points = Array.from({ length: 12 }, (_, index) => ({
      year: index + 1,
      valueK: index + 1,
    }));

    expect(component.labelFor(component.points[0])).toBe('Jan');
    expect(component.labelFor(component.points[11])).toBe('Dec');
  });

  it('formats tooltip values in K units', () => {
    const point = { year: 2026, valueK: 12.5 };

    expect(component.tooltipLabel(point)).toBe('2026');
    expect(component.tooltipValue(point)).toBe('12.5K');
  });
});
