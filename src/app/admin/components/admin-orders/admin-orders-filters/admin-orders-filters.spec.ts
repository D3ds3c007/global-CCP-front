import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrdersFilters } from './admin-orders-filters';

describe('AdminOrdersFilters', () => {
  let component: AdminOrdersFilters;
  let fixture: ComponentFixture<AdminOrdersFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrdersFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrdersFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
