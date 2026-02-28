import { TestBed } from '@angular/core/testing';

import { AdminComissionsBack } from './admin-comissions-back';

describe('AdminComissionsBack', () => {
  let service: AdminComissionsBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminComissionsBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
