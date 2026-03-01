import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminCustomersBack } from './admin-customers-back';

describe('AdminCustomersBack', () => {
  let service: AdminCustomersBack;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminCustomersBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
