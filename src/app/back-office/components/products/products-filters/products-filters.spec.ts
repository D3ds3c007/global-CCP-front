import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsFilters } from './products-filters';

describe('ProductsFilters', () => {
  let component: ProductsFilters;
  let fixture: ComponentFixture<ProductsFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
