import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowStockComponent } from './low-stock';

describe('LowStockComponent', () => {
  let component: LowStockComponent;
  let fixture: ComponentFixture<LowStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowStockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LowStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the empty state when there are no products', () => {
    component.products = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No low-stock products.');
  });

  it('renders one stock card per product', () => {
    component.products = [
      { id: '1', name: 'Alpha', stock: 2, minStock: 8 },
      { id: '2', name: 'Beta', stock: 4, minStock: 10 },
    ];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.stock-card').length).toBe(2);
  });

  it('marks products below half min stock as critical', () => {
    const product = { id: '1', name: 'Alpha', stock: 2, minStock: 8 };

    expect(component.severityLabel(product)).toBe('Critical');
    expect(component.shortage(product)).toBe(6);
  });
});
