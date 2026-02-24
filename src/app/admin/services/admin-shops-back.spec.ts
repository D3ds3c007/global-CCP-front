import { TestBed } from '@angular/core/testing';

import { AdminShopsBack } from './admin-shops-back';

describe('AdminShopsBack', () => {
  let service: AdminShopsBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminShopsBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
