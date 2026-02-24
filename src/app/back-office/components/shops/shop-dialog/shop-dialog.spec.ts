import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopDialog } from './shop-dialog';

describe('ShopDialog', () => {
  let component: ShopDialog;
  let fixture: ComponentFixture<ShopDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
