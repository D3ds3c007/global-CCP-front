import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsLayout } from './details-layout';

describe('DetailsLayout', () => {
  let component: DetailsLayout;
  let fixture: ComponentFixture<DetailsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
