import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopStatus } from '../../../services/dashboard-service';

@Component({
  selector: 'app-shop-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class.ACTIVE]="status === 'ACTIVE'" [class.PENDING]="status === 'PENDING'">
      {{ status === 'ACTIVE' ? 'Shop ACTIVE' : 'Shop pending' }}
    </span>
  `,
  styles: [`
    .badge {
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .badge.ACTIVE { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
    .badge.PENDING { background: #fff7ed; color: #9a3412; border-color: #fed7aa; }
  `],
})
export class ShopStatusBadgeComponent {
  @Input({ required: true }) status!: ShopStatus;
}
