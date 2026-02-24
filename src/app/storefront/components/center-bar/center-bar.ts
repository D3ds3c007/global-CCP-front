import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importe le Router

@Component({
  selector: 'app-center-bar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Ajoute RouterModule ici
  templateUrl: './center-bar.html',
  styleUrl: './center-bar.css',
})
export class CenterBar {
  constructor(private router: Router) {}

  // Vérifie si la route actuelle correspond à l'onglet
  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Navigue vers la nouvelle route
  selectTab(tab: 'products' | 'manufacturers') {
    const targetRoute = tab === 'products' ? '/' : '/manufacturers';
    this.router.navigateByUrl(targetRoute);
  }
}