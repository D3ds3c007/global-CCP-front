import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShopsTable } from './admin-shops-table';

describe('AdminShopsTable', () => {
  let component: AdminShopsTable;
  let fixture: ComponentFixture<AdminShopsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShopsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShopsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
