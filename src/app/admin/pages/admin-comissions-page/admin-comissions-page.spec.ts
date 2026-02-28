import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminComissionsPage } from './admin-comissions-page';

describe('AdminComissionsPage', () => {
  let component: AdminComissionsPage;
  let fixture: ComponentFixture<AdminComissionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComissionsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComissionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
