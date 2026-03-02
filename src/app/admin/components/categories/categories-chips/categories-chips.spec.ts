import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesChipsComponent } from './categories-chips';

describe('CategoriesChipsComponent', () => {
  let component: CategoriesChipsComponent;
  let fixture: ComponentFixture<CategoriesChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesChipsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one card per category', () => {
    component.categories = [
      { id: '1', name: 'Bakery', type: 'food', status: 'active' },
      { id: '2', name: 'Craft', type: 'art', status: 'inactive' },
    ] as any;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.category-card').length).toBe(2);
  });

  it('returns the correct toggle label', () => {
    expect(component.toggleLabel({ id: '1', name: 'Bakery', type: 'food', status: 'active' } as any)).toBe('Disable');
    expect(component.toggleLabel({ id: '2', name: 'Craft', type: 'art', status: 'inactive' } as any)).toBe('Enable');
  });
});
