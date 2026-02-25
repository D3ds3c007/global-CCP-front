import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDialog } from './category-dialog';

describe('CategoryDialog', () => {
  let component: CategoryDialog;
  let fixture: ComponentFixture<CategoryDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
