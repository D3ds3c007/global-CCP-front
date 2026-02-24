import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorefrontLayoutComponent } from './storefront-layout.component';

describe('StorefrontLayoutComponent', () => {
  let component: StorefrontLayoutComponent;
  let fixture: ComponentFixture<StorefrontLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StorefrontLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
