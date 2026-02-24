import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar, NavItem } from '../../../back-office/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css'],
})
export class AdminLayout {
adminNav: NavItem[] = [
  { kind: 'link', label: 'Shops', icon: 'store', route: ['/admin', 'shops'] },
  { kind: 'link', label: 'Categories', icon: 'category', route: ['/admin', 'categories'] },
];
}