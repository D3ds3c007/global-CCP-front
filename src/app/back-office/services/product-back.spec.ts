import { TestBed } from '@angular/core/testing';

import { ProductBack } from './product-back';

describe('ProductBack', () => {
  let service: ProductBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
