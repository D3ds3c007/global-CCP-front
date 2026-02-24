import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastOrdersTable } from './last-orders-table';

describe('LastOrdersTable', () => {
  let component: LastOrdersTable;
  let fixture: ComponentFixture<LastOrdersTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastOrdersTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastOrdersTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
