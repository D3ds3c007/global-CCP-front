import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesFilters } from './categories-filters';

describe('CategoriesFilters', () => {
  let component: CategoriesFilters;
  let fixture: ComponentFixture<CategoriesFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
