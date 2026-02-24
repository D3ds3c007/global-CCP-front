import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopRow } from './shop-row';

describe('ShopRow', () => {
  let component: ShopRow;
  let fixture: ComponentFixture<ShopRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopRow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopRow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
