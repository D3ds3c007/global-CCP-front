import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { AdminCommissionsBackService, FeeMutationResult } from '../../services/admin-comissions-back';
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
  styles: [`
    .page{padding:18px;background:#f5f6fa;min-height:100vh}
    .title{margin:0 0 14px;font-size:22px;font-weight:900;color:#0f172a}

    .fab{
      position:fixed;
      right:28px;
      bottom:28px;
      width:64px;
      height:64px;
      border-radius:999px;
      border:none;
      background:#0b0f19;
      color:#fff;
      font-size:34px;
      line-height:0;
      cursor:pointer;
      box-shadow:0 18px 40px rgba(0,0,0,0.25);
    }
  `],
})
export class AdminCommissionsPage implements OnInit {
  private service = inject(AdminCommissionsBackService);
  vm$ = this.service.vm$;

  dialogOpen = false;

  openCreate() { this.dialogOpen = true; }
  closeDialog() { this.dialogOpen = false; }

  ngOnInit(): void {
    this.service.loadFees().subscribe({
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

  activate(id: string) {
    this.service.setActive(id).subscribe({
      next: (res: FeeMutationResult) => this.alertMessage(res.message),
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

  deactivateAll() {
    this.service.deactivateAll().subscribe({
      next: (res: FeeMutationResult) => this.alertMessage(res.message),
      error: (err: Error) => this.alertMessage(err.message),
    });
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
    }).subscribe({
      next: (res: FeeMutationResult) => {
        this.closeDialog();
        this.alertMessage(res.message);
      },
      error: (err: Error) => this.alertMessage(err.message),
    });
  }

  private alertMessage(message?: string) {
    if (!message || typeof window === 'undefined') return;
    window.alert(message);
  }
}
