import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ManufacturePage } from './manufacture-page';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ManufactureService } from '../../services/manufacture-service';

describe('ManufacturePage', () => {
  let component: ManufacturePage;
  let fixture: ComponentFixture<ManufacturePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturePage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ shopId: 'shop-1' }))
          }
        },
        {
          provide: AuthStateService,
          useValue: {
            currentUser$: of(null),
            logout: jasmine.createSpy('logout')
          }
        },
        {
          provide: CartService,
          useValue: {
            addItem: jasmine.createSpy('addItem').and.returnValue(of(null))
          }
        },
        {
          provide: ProductService,
          useValue: {
            getProductsByShopId: jasmine.createSpy('getProductsByShopId').and.returnValue(of({ items: [], total: 0 }))
          }
        },
        {
          provide: ManufactureService,
          useValue: {
            getBoutiqueById: jasmine.createSpy('getBoutiqueById').and.returnValue(of(null))
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
