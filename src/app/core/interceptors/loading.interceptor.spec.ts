import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LoadingService } from '../services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let visible: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    visible = false;

    TestBed.inject(LoadingService).loading$.subscribe((state) => {
      visible = state;
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows for successful requests and clears after finalize', fakeAsync(() => {
    http.get('/api/products').subscribe();

    tick(150);
    expect(visible).toBe(true);

    httpMock.expectOne('/api/products').flush({ ok: true });
    tick(250);

    expect(visible).toBe(false);
  }));

  it('clears on HTTP errors', fakeAsync(() => {
    let error: HttpErrorResponse | null = null;

    http.get('/api/fail').subscribe({
      error: (err) => {
        error = err;
      }
    });

    tick(150);
    expect(visible).toBe(true);

    httpMock.expectOne('/api/fail').flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    tick(250);

    expect(error).not.toBeNull();
    expect(visible).toBe(false);
  }));

  it('stays visible until parallel requests are complete', fakeAsync(() => {
    http.get('/api/a').subscribe();
    http.get('/api/b').subscribe();

    tick(150);
    expect(visible).toBe(true);

    httpMock.expectOne('/api/a').flush({ ok: true });
    tick(500);
    expect(visible).toBe(true);

    httpMock.expectOne('/api/b').flush({ ok: true });
    tick(250);
    expect(visible).toBe(false);
  }));

  it('ignores static asset requests', fakeAsync(() => {
    http.get('/assets/logo.svg', { responseType: 'text' }).subscribe();

    tick(500);
    expect(visible).toBe(false);

    httpMock.expectOne('/assets/logo.svg').flush('<svg></svg>');
    tick(10);

    expect(visible).toBe(false);
  }));

  it('does not mutate withCredentials requests', fakeAsync(() => {
    http.get('/api/secure', { withCredentials: true }).subscribe();

    const request = httpMock.expectOne('/api/secure');
    expect(request.request.withCredentials).toBe(true);

    tick(150);
    expect(visible).toBe(true);

    request.flush({ ok: true });
    tick(250);

    expect(visible).toBe(false);
  }));
});
