import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturePage } from './manufacture-page';

describe('ManufacturePage', () => {
  let component: ManufacturePage;
  let fixture: ComponentFixture<ManufacturePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
