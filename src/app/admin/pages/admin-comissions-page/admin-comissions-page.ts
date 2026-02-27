import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { AdminCommissionsBackService } from '../../services/admin-comissions-back';
import { ComissionsTableComponent } from '../../components/comissions/comissions-table/comissions-table';
import { ComissionDialogComponent } from '../../components/comissions/comission-dialog/comission-dialog';

// reuse existing card
import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';

@Component({
  selector: 'app-admin-commissions-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    ComissionsTableComponent,
    ComissionDialogComponent
  ],
  templateUrl: './admin-comissions-page.html',
  styleUrls: ['./admin-comissions-page.css'],
})
export class AdminCommissionsPage {
  private service = inject(AdminCommissionsBackService);
  vm$ = this.service.vm$;

  dialogOpen = false;

  openCreate() { this.dialogOpen = true; }
  closeDialog() { this.dialogOpen = false; }

  activate(id: string) {
    this.service.setActive(id);
  }

  deactivateAll() {
    this.service.deactivateAll();
  }

  onSave(e: {
    name: string;
    thresholdEur: number;
    fixedUnderUsd: number;
    percentAbove: number;
    activateNow: boolean;
  }) {
    this.service.create({
      name: e.name,
      rule: {
        thresholdEur: e.thresholdEur,
        fixedUnderUsd: e.fixedUnderUsd,
        percentAbove: e.percentAbove,
      },
      activateNow: e.activateNow,
    });

    this.closeDialog();
  }
}