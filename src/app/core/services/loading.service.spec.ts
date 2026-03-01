import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;
  let visible: boolean;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    visible = false;

    service.loading$.subscribe((state) => {
      visible = state;
    });
  });

  it('does not become visible immediately when loading starts', () => {
    service.startRequest();

    expect(visible).toBe(false);
  });

  it('becomes visible after 150ms', fakeAsync(() => {
    service.startRequest();

    tick(149);
    expect(visible).toBe(false);

    tick(1);
    expect(visible).toBe(true);
  }));

  it('stays hidden when loading ends before the show threshold', fakeAsync(() => {
    service.startRequest();

    tick(100);
    service.endRequest();
    tick(100);

    expect(visible).toBe(false);
  }));

  it('remains visible until the minimum display time elapses', fakeAsync(() => {
    service.startRequest();
    tick(150);

    expect(visible).toBe(true);

    service.endRequest();
    tick(249);
    expect(visible).toBe(true);

    tick(1);
    expect(visible).toBe(false);
  }));

  it('stays visible while overlapping loading sources are active', fakeAsync(() => {
    service.startRequest();
    service.startNavigation();
    tick(150);

    expect(visible).toBe(true);

    service.endRequest();
    tick(500);
    expect(visible).toBe(true);

    service.endNavigation();
    tick(250);
    expect(visible).toBe(false);
  }));

  it('does not get stuck when end methods are called extra times', fakeAsync(() => {
    service.endRequest();
    service.endNavigation();
    service.startRequest();
    tick(150);

    expect(visible).toBe(true);

    service.endRequest();
    service.endRequest();
    service.endNavigation();
    tick(250);

    expect(visible).toBe(false);
  }));
});
