import { TestBed } from '@angular/core/testing';

import { StoreFrontState } from './store-front-state';

describe('StoreFrontState', () => {
  let service: StoreFrontState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreFrontState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
