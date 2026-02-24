import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterGoal } from './quarter-goal';

describe('QuarterGoal', () => {
  let component: QuarterGoal;
  let fixture: ComponentFixture<QuarterGoal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterGoal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuarterGoal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
