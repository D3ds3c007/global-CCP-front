import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopProductsComponent } from './top-products';

describe('TopProductsComponent', () => {
  let component: TopProductsComponent;
  let fixture: ComponentFixture<TopProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopProductsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders empty state when there are no products', () => {
    component.products = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No products.');
  });

  it('renders one donut segment per positive-value product', () => {
    component.products = [
      { name: 'ALPHA', valueK: 12, productId: '1' },
      { name: 'BETA', valueK: 8, productId: '2' },
      { name: 'GAMMA', valueK: 0, productId: '3' },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.donut-segment').length).toBe(2);
  });

  it('shows the highest-value product in the center label', () => {
    component.products = [
      { name: 'ALPHA', valueK: 12, productId: '1' },
      { name: 'BETA', valueK: 18, productId: '2' },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.center-name')?.textContent).toContain('BETA');
  });

  it('renders a full donut segment when only one product exists', () => {
    component.products = [{ name: 'SOLO', valueK: 24, productId: '1' }];

    expect(component.segments.length).toBe(1);
    expect(component.segments[0].dasharray).toContain(String(component.circumference));
  });
});
