import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComissionDialog } from './comission-dialog';

describe('ComissionDialog', () => {
  let component: ComissionDialog;
  let fixture: ComponentFixture<ComissionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComissionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComissionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
