import { TestBed } from '@angular/core/testing';

import { CustomersBack } from './customers-back';

describe('CustomersBack', () => {
  let service: CustomersBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomersBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
