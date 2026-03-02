import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('maps plain array category responses', () => {
    let result: unknown;

    service.getCategories().subscribe(categories => {
      result = categories;
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET'
      && request.url === 'http://localhost:5000/api/v1/categories'
      && request.params.get('type') === 'PRODUCT'
      && request.withCredentials
    );

    req.flush([{ _id: 'c1', name: 'Phones', type: 'PRODUCT', isActive: true }]);

    expect(result).toEqual([{ id: 'c1', name: 'Phones' }]);
  });

  it('filters out explicitly inactive categories', () => {
    let result: unknown;

    service.getCategories().subscribe(categories => {
      result = categories;
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1/categories?type=PRODUCT');
    req.flush([
      { _id: 'c1', name: 'Phones', type: 'PRODUCT', isActive: true },
      { _id: 'c2', name: 'Archived', type: 'PRODUCT', isActive: false }
    ]);

    expect(result).toEqual([{ id: 'c1', name: 'Phones' }]);
  });

  it('supports wrapped category responses', () => {
    let result: unknown;

    service.getCategories().subscribe(categories => {
      result = categories;
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1/categories?type=PRODUCT');
    req.flush({
      categories: [{ _id: 'c1', name: 'Phones', isActive: true }]
    });

    expect(result).toEqual([{ id: 'c1', name: 'Phones' }]);
  });

  it('returns an empty array when the request fails', () => {
    let result: unknown;

    service.getCategories().subscribe(categories => {
      result = categories;
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1/categories?type=PRODUCT');
    req.flush('boom', { status: 500, statusText: 'Server Error' });

    expect(result).toEqual([]);
  });
});
