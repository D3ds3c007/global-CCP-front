import { TestBed } from '@angular/core/testing';

import { AdminOrdersBack } from './admin-orders-back';

describe('AdminOrdersBack', () => {
  let service: AdminOrdersBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminOrdersBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
