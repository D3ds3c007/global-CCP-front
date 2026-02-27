import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CommissionRule {
  thresholdEur: number;      // ex: 500
  fixedUnderUsd: number;     // ex: 1  (si total < threshold)
  percentAbove: number;      // ex: 3  (si total >= threshold)
}

export interface Commission {
  id: string;
  name: string;
  rule: CommissionRule;
  active: boolean;
  createdAt: string; // ISO
}

export interface AdminCommissionsVM {
  commissions: Commission[];
  activeId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminCommissionsBackService {
  private readonly commissionsSubject = new BehaviorSubject<Commission[]>(this.seed());

  /** vm simple (pas besoin de query pour le moment) */
  readonly vm$: Observable<AdminCommissionsVM> = new Observable(sub => {
    const s = this.commissionsSubject.subscribe(list => {
      const active = list.find(x => x.active)?.id ?? null;
      sub.next({ commissions: list, activeId: active });
    });
    return () => s.unsubscribe();
  });

  get snapshot(): Commission[] {
    return this.commissionsSubject.value;
  }

  /** Create (pas de delete) */
  create(input: { name: string; rule: CommissionRule; activateNow?: boolean }) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'com-' + Date.now();

    const newItem: Commission = {
      id,
      name: input.name,
      rule: input.rule,
      active: false,
      createdAt: new Date().toISOString(),
    };

    let next: Commission[] = [newItem, ...this.commissionsSubject.value];

    // si activateNow => active unique
    if (input.activateNow) {
      next = next.map(c => ({ ...c, active: c.id === id }));
    }

    this.commissionsSubject.next(next);
  }

  /** Active UNIQUE : activer une => désactive toutes les autres */
  setActive(id: string) {
    const next: Commission[] = this.commissionsSubject.value.map(c => ({
      ...c,
      active: c.id === id,
    }));
    this.commissionsSubject.next(next);
  }

  /** Désactiver tout (optionnel, si tu veux permettre "aucune active") */
  deactivateAll() {
    const next: Commission[] = this.commissionsSubject.value.map(c => ({ ...c, active: false }));
    this.commissionsSubject.next(next);
  }

  /** Calcul de commission selon la commission active */
  computeCommission(orderTotalEur: number): number {
    const active = this.commissionsSubject.value.find(c => c.active);
    if (!active) return 0;

    const { thresholdEur, fixedUnderUsd, percentAbove } = active.rule;
    if (orderTotalEur < thresholdEur) return fixedUnderUsd;

    // ex: 3% de la commande
    return +(orderTotalEur * (percentAbove / 100)).toFixed(2);
  }

  private seed(): Commission[] {
    const now = new Date().toISOString();
    const data: Commission[] = [
      {
        id: 'com-default',
        name: 'Default Commission',
        rule: { thresholdEur: 500, fixedUnderUsd: 1, percentAbove: 3 },
        active: true,
        createdAt: now,
      },
      {
        id: 'com-low',
        name: 'Low Commission',
        rule: { thresholdEur: 500, fixedUnderUsd: 1, percentAbove: 2 },
        active: false,
        createdAt: now,
      },
    ];
    return data;
  }
}