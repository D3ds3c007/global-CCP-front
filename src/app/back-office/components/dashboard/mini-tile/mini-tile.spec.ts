import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTile } from './mini-tile';

describe('MiniTile', () => {
  let component: MiniTile;
  let fixture: ComponentFixture<MiniTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniTile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniTile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
