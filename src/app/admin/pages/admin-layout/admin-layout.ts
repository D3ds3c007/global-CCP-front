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
    { kind: 'link', label: 'Dashboard', icon: 'space_dashboard', route: ['/admin', 'dashboard'] },
    { kind: 'link', label: 'Shop', icon: 'store', route: ['/admin', 'shops'] },
    { kind: 'link', label: 'Categories', icon: 'category', route: ['/admin', 'categories'] },
    { kind: 'link', label: 'Users', icon: 'group', route: ['/admin', 'customers'] }, // page plus tard
  ];
}