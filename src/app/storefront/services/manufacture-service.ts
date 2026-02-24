import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Manufacture {
  nom: string;
  description: string;

  logoUrl: string;

  contact: {
    telephone?: string | null;
    email?: string | null;
    adresse?: string | null;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ManufactureService {
  getBoutiqueMock(): Observable<Manufacture> {
    return of({
      nom: 'Ma Boutique',
      description: 'Une boutique est un petit commerce de détail spécialisé, physique ou en ligne, proposant une sélection exclusive de produits (vêtements, luxe, artisanat) avec .un service personnalisé et une expérience d’achat unique.',
      logoUrl: 'https://picsum.photos/id/1062/800/560',
      contact: {
        telephone: '+33 6 12 34 56 78',
        email: 'contact@maboutique.fr',
        adresse: '10 rue Exemple, 75000 Paris',
      }
    });
  }
}
