import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY } from 'rxjs';

import {
  AdminShopsBackService,
  Shop,
  ShopStatus,
  ShopStatusUpdate,
  ShopsQuery,
} from '../../services/admin-shops-back';
import { AdminShopsFiltersComponent } from '../../components/admin-shops-filters/admin-shops-filters';

import { DashboardCardComponent } from '../../../back-office/components/dashboard/dashboard-card/dashboard-card';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-shops-page',
  standalone: true,
  imports: [CommonModule, DashboardCardComponent, AdminShopsFiltersComponent],
  templateUrl: './admin-shops-page.html',
  styleUrls: ['./admin-shops-page.css'],
})
export class AdminShopsPage {
  private readonly service = inject(AdminShopsBackService);
  readonly pictureUrl = environment.pictureUrl;
  readonly vm$ = this.service.vm$;

  selectedShop: Shop | null = null;
  detailsOpen = false;
  loadingDetails = false;
  updatingShopId: string | null = null;

  readonly badgeClassMap: Record<ShopStatus, string> = {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    REJECTED: 'rejected',
  };

  setQuery(patch: Partial<ShopsQuery>) {
    this.service.setQuery(patch);
  }

  trackByShopId(_: number, shop: Shop) {
    return shop._id;
  }

  openShopDetails(shop: Shop) {
    this.selectedShop = shop;
    this.detailsOpen = true;

    const hasFullDetails = !!(
      shop.description ||
      shop.coverUrl ||
      shop.contact?.phone ||
      shop.socials?.website ||
      shop.openingHours
    );

    if (hasFullDetails || !shop._id) return;

    this.loadingDetails = true;
    this.service.getShopById(shop._id).pipe(
      catchError(() => {
        this.loadingDetails = false;
        alert('Failed to load shop details.');
        return EMPTY;
      })
    ).subscribe(fullShop => {
      this.selectedShop = {
        ...shop,
        ...fullShop,
        ownerName: fullShop.ownerName ?? shop.ownerName,
        categoryName: fullShop.categoryName ?? shop.categoryName,
      };
      this.loadingDetails = false;
    });
  }

  closeShopDetails() {
    this.detailsOpen = false;
    this.selectedShop = null;
    this.loadingDetails = false;
  }

  onSetStatus(event: Event, shop: Shop, status: ShopStatusUpdate) {
    event.stopPropagation();

    if (!shop._id || shop.status === status || this.updatingShopId === shop._id) return;

    this.updatingShopId = shop._id;
    this.service.updateShopStatus(shop._id, status).pipe(
      catchError(() => {
        this.updatingShopId = null;
        alert('Failed to update shop status.');
        return EMPTY;
      })
    ).subscribe(updated => {
      if (this.selectedShop?._id === updated._id) {
        this.selectedShop = { ...this.selectedShop, ...updated };
      }
      this.updatingShopId = null;
    });
  }

  isStatusActionDisabled(shop: Shop, status: ShopStatusUpdate) {
    return this.updatingShopId === shop._id || shop.status === status;
  }

  badgeClass(status: ShopStatus) {
    return this.badgeClassMap[status] ?? 'pending';
  }

  formatDate(value?: string) {
    if (!value) return '-';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  }

  valueOrDash(value?: string | null) {
    return value && value.trim() ? value : '-';
  }

  displayOwner(shop: Shop) {
    return this.valueOrDash(shop.ownerName || shop.ownerUserId);
  }

  displayCategory(shop: Shop) {
    return this.valueOrDash(shop.categoryName || shop.categoryId);
  }

  formatDialogDate(value?: string) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    try {
      return d.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
      } as Intl.DateTimeFormatOptions);
    } catch {
      return d.toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }
}
