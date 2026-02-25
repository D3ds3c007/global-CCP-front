import { TestBed } from '@angular/core/testing';

import { AdminCategoriesBack } from './admin-categories-back';

describe('AdminCategoriesBack', () => {
  let service: AdminCategoriesBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCategoriesBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
