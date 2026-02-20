import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterBar } from './center-bar';

describe('CenterBar', () => {
  let component: CenterBar;
  let fixture: ComponentFixture<CenterBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
