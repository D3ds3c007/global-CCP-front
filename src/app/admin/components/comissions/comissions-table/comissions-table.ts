import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Commission } from '../../../services/admin-comissions-back';

@Component({
  selector: 'app-commissions-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comissions-table.html',
  styleUrls: ['./comissions-table.css'],
})
export class ComissionsTableComponent {
  @Input() commissions: Commission[] = [];
  @Output() activate = new EventEmitter<string>();
  @Output() deactivateAll = new EventEmitter<void>();

  trackByCommissionId = (_: number, c: Commission) => c._id || c.id;
}
