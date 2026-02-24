import { TestBed } from '@angular/core/testing';

import { AdminCustomersBack } from './admin-customers-back';

describe('AdminCustomersBack', () => {
  let service: AdminCustomersBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCustomersBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
