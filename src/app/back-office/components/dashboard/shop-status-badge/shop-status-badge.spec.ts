import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopStatusBadge } from './shop-status-badge';

describe('ShopStatusBadge', () => {
  let component: ShopStatusBadge;
  let fixture: ComponentFixture<ShopStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopStatusBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopStatusBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
