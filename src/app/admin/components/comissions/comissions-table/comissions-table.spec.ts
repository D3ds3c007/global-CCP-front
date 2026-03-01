import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComissionsTable } from './comissions-table';

describe('ComissionsTable', () => {
  let component: ComissionsTable;
  let fixture: ComponentFixture<ComissionsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComissionsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComissionsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
