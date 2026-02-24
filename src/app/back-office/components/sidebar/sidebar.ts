import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type NavLinkItem = {
  kind: 'link';
  label: string;
  icon: string;
  route: any[];
};

export type NavDividerItem = {
  kind: 'divider';
  label?: string;
};

export type NavItem = NavLinkItem | NavDividerItem;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'], // ✅ recommandé (voir note en bas)
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
})
export class Sidebar {
  @Output() logout = new EventEmitter<void>();

  collapsed = false;
  search = '';

  @Input() brand = 'OrangeFarm';

  @Input() user = {
    name: 'Gustavo Xavier',
    role: 'Admin',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
  };

  @Input() nav: NavItem[] = [
    { kind: 'link', label: 'Dashboard', icon: 'space_dashboard', route: ['/owner', 'dashboard'] },
    { kind: 'link', label: 'Customers', icon: 'group', route: ['/owner', 'customers'] },
    { kind: 'link', label: 'Products', icon: 'inventory_2', route: ['/owner', 'products'] },
    { kind: 'link', label: 'Orders', icon: 'public', route: ['/owner', 'orders'] },
  ];

  // helpers pour le template (narrow union type)
  isLink(item: NavItem): item is NavLinkItem {
    return item.kind === 'link';
  }
  isDivider(item: NavItem): item is NavDividerItem {
    return item.kind === 'divider';
  }

  get filteredNav(): NavItem[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.nav;

    // filtre seulement les links
    return (this.nav.filter(this.isLink) as NavLinkItem[])
      .filter(l => l.label.toLowerCase().includes(q));
  }

  toggle() {
    this.collapsed = !this.collapsed;
  }

  onLogout() {
    this.logout.emit();
  }
}