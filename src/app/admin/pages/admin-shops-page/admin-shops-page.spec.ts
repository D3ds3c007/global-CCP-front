import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShopsPage } from './admin-shops-page';

describe('AdminShopsPage', () => {
  let component: AdminShopsPage;
  let fixture: ComponentFixture<AdminShopsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShopsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminShopsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
