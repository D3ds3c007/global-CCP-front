import { Component, EventEmitter, Output } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

type NavItem = {
  label: string;
  icon: string;      // material icon name
  route?: string;
  children?: NavItem[];
};

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    RouterLinkActive
  ],
})
export class Sidebar {
  @Output() logout = new EventEmitter<void>();

  collapsed = false;
  search = '';

  user = {
    name: 'Gustavo Xavier',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
  };

  nav: NavItem[] = [
    { label: 'Dashboard', icon: 'space_dashboard', route: 'owner/dashboard' },
    { label: 'Customers', icon: 'group', route: 'owner/customers' },
    { label: 'Products', icon: 'inventory_2', route: 'owner/products' },
    { label: 'Orders', icon: 'public', route: 'owner/orders' },
  ];

  toggle() {
    this.collapsed = !this.collapsed;
  }

  onLogout() {
    this.logout.emit();
  }
}
