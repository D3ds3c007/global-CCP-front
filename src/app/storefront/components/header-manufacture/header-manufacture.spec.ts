import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderManufacture } from './header-manufacture';

describe('HeaderManufacture', () => {
  let component: HeaderManufacture;
  let fixture: ComponentFixture<HeaderManufacture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderManufacture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderManufacture);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
