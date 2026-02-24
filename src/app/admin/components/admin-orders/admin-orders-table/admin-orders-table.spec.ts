import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrdersTable } from './admin-orders-table';

describe('AdminOrdersTable', () => {
  let component: AdminOrdersTable;
  let fixture: ComponentFixture<AdminOrdersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrdersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrdersTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
