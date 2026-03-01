import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const LOADER_SHOW_DELAY_MS = 150;
const LOADER_MIN_VISIBLE_MS = 250;

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly visibleSubject = new BehaviorSubject<boolean>(false);

  readonly loading$ = this.visibleSubject.asObservable();

  private navigationCount = 0;
  private requestCount = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private visibleSince = 0;

  startNavigation(): void {
    this.navigationCount += 1;
    this.syncVisibility();
  }

  endNavigation(): void {
    this.navigationCount = Math.max(0, this.navigationCount - 1);
    this.syncVisibility();
  }

  startRequest(): void {
    this.requestCount += 1;
    this.syncVisibility();
  }

  endRequest(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    this.syncVisibility();
  }

  private syncVisibility(): void {
    if (this.isLoading()) {
      this.cancelHideTimer();

      if (this.visibleSubject.value || this.showTimer) {
        return;
      }

      this.showTimer = setTimeout(() => {
        this.showTimer = null;

        if (!this.isLoading() || this.visibleSubject.value) {
          return;
        }

        this.visibleSince = Date.now();
        this.visibleSubject.next(true);
      }, LOADER_SHOW_DELAY_MS);

      return;
    }

    this.cancelShowTimer();

    if (!this.visibleSubject.value) {
      return;
    }

    const elapsed = Date.now() - this.visibleSince;
    const remaining = Math.max(0, LOADER_MIN_VISIBLE_MS - elapsed);

    if (remaining === 0) {
      this.hideNow();
      return;
    }

    if (this.hideTimer) {
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;

      if (this.isLoading()) {
        return;
      }

      this.hideNow();
    }, remaining);
  }

  private isLoading(): boolean {
    return this.navigationCount + this.requestCount > 0;
  }

  private hideNow(): void {
    this.visibleSince = 0;
    this.visibleSubject.next(false);
  }

  private cancelShowTimer(): void {
    if (!this.showTimer) {
      return;
    }

    clearTimeout(this.showTimer);
    this.showTimer = null;
  }

  private cancelHideTimer(): void {
    if (!this.hideTimer) {
      return;
    }

    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
}
