import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComissionsTableComponent } from './comissions-table';

describe('ComissionsTableComponent', () => {
  let component: ComissionsTableComponent;
  let fixture: ComponentFixture<ComissionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComissionsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComissionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one commission card per commission', () => {
    component.commissions = [
      {
        _id: '1',
        id: '1',
        name: 'Default',
        active: true,
        createdAt: '2026-01-01',
        rule: { thresholdEur: 100, fixedUnderUsd: 8, percentAbove: 12 },
      },
      {
        _id: '2',
        id: '2',
        name: 'Seasonal',
        active: false,
        createdAt: '2026-01-02',
        rule: { thresholdEur: 80, fixedUnderUsd: 6, percentAbove: 10 },
      },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.commission-card').length).toBe(2);
  });

  it('returns the right status label', () => {
    expect(component.statusLabel({ active: true } as any)).toBe('Active strategy');
    expect(component.statusLabel({ active: false } as any)).toBe('Inactive strategy');
  });
});
