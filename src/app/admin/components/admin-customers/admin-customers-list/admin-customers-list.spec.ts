import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCustomersList } from './admin-customers-list';

describe('AdminCustomersList', () => {
  let component: AdminCustomersList;
  let fixture: ComponentFixture<AdminCustomersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCustomersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCustomersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
