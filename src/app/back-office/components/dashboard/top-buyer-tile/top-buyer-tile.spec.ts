import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopBuyerTile } from './top-buyer-tile';

describe('TopBuyerTile', () => {
  let component: TopBuyerTile;
  let fixture: ComponentFixture<TopBuyerTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBuyerTile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopBuyerTile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
