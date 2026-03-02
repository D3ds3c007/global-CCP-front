import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminCustomersPage } from './admin-customers-page';

describe('AdminCustomersPage', () => {
  let component: AdminCustomersPage;
  let fixture: ComponentFixture<AdminCustomersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCustomersPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCustomersPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
