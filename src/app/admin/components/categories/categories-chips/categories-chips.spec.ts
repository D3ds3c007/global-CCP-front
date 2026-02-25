import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesChips } from './categories-chips';

describe('CategoriesChips', () => {
  let component: CategoriesChips;
  let fixture: ComponentFixture<CategoriesChips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesChips]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesChips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
