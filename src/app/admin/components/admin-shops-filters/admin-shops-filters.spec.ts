import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShopsFilters } from './admin-shops-filters';

describe('AdminShopsFilters', () => {
  let component: AdminShopsFilters;
  let fixture: ComponentFixture<AdminShopsFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShopsFilters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShopsFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
