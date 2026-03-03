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
      font-weight: 800;
      letter-spacing: 0.03em;
      border: 1px solid transparent;
      white-space: nowrap;
      box-shadow:
        0 10px 18px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.24);
    }
    .badge.ACTIVE {
      background: linear-gradient(135deg, #8ffb3c 0%, #22e6bf 55%, #00cfdb 100%);
      color: #05221a;
      border-color: rgba(67, 217, 95, 0.42);
    }
    .badge.PENDING {
      background: linear-gradient(135deg, #ffd166 0%, #ff9f43 52%, #ff7a59 100%);
      color: #4a1d00;
      border-color: rgba(251, 146, 60, 0.42);
    }
  `],
})
export class ShopStatusBadgeComponent {
  @Input({ required: true }) status!: ShopStatus;
}
