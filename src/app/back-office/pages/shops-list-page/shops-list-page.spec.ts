import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopsListPage } from './shops-list-page';

describe('ShopsListPage', () => {
  let component: ShopsListPage;
  let fixture: ComponentFixture<ShopsListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopsListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopsListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
