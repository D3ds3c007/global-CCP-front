import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminShopRowVM, ShopStatus } from '../../services/admin-shops-back';

@Component({
  selector: 'app-admin-shops-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-shops-table.html',
  styleUrls: ['./admin-shops-table.css'],
})
export class AdminShopsTableComponent {
  @Input() shops: AdminShopRowVM[] = [];
  @Output() statusChange = new EventEmitter<{ id: string; status: ShopStatus }>();
}