import { Component } from '@angular/core';
import { Manufacture } from '../../services/manufacture-service';
import { CommonModule } from '@angular/common';
import { ManufactureService } from '../../services/manufacture-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header-manufacture',
  imports: [CommonModule],
  templateUrl: './header-manufacture.html',
  styleUrl: './header-manufacture.css',
})
export class HeaderManufacture {
  boutique$: Observable<Manufacture>;

  constructor(private manufactureService: ManufactureService) {
    this.boutique$ = this.manufactureService.getBoutiqueMock(); // MOCK
  }
}
