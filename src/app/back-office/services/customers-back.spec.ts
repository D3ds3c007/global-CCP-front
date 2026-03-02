import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CustomersBack } from './customers-back';

describe('CustomersBack', () => {
  let service: CustomersBack;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
